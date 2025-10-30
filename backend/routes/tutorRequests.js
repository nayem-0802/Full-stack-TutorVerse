const express = require('express');
const router = express.Router();
const supabase = require('../supabaseConfig');

// Send request to tutor
router.post('/send', async (req, res) => {
  const { studentId, tutorId, message } = req.body;
  
  try {
    // শুধু pending status এর request check করা হচ্ছে
    // Accept/Reject হলে আবার নতুন request পাঠানো যাবে
    const { data: existing } = await supabase
      .from('tutor_requests')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .eq('status', 'pending')
      .single();
    
    // Pending request থাকলে error return করবে
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already sent a pending request to this tutor'
      });
    }
    
    // নতুন request create করা হচ্ছে default status 'pending' দিয়ে
    const { data, error } = await supabase
      .from('tutor_requests')
      .insert([{
        student_id: studentId,
        tutor_id: tutorId,
        message: message,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Request sent successfully!',
      request: data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get requests for tutor
router.get('/tutor/:tutorId', async (req, res) => {
  const { tutorId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('tutor_requests')
      .select(`
        *,
        student:profiles!tutor_requests_student_id_fkey(full_name, email, phone, address)
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      requests: data,
      message: `${data.length} requests found`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update request status
router.put('/:requestId/status', async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('tutor_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request: data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Check if student has sent request to tutor
router.get('/check/:tutorId/:studentId', async (req, res) => {
  const { tutorId, studentId } = req.params;
  
  try {
    // সবচেয়ে সাম্প্রতিক request fetch করা হচ্ছে order by created_at desc দিয়ে
    const { data, error } = await supabase
      .from('tutor_requests')
      .select('id, status')
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Response এ status field add করা হয়েছে যা frontend এ use হবে
    res.json({
      success: true,
      hasRequested: !!data,
      status: data?.status || null // 'pending', 'accepted', 'rejected'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get requests sent by student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  
  try {
    // First get tutor_requests
    const { data: requests, error: requestsError } = await supabase
      .from('tutor_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (requestsError) {
      console.error('Requests fetch error:', requestsError);
      return res.status(400).json({
        success: false,
        message: requestsError.message
      });
    }

    if (!requests || requests.length === 0) {
      return res.json({
        success: true,
        requests: [],
        message: '0 requests found'
      });
    }

    // Get all unique tutor IDs
    const tutorIds = [...new Set(requests.map(req => req.tutor_id))];

    // Fetch tutor profiles
    const { data: tutorProfiles, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('user_id, first_name, last_name, ssc_result, hsc_result')
      .in('user_id', tutorIds);

    if (tutorError) {
      console.error('Tutor profiles fetch error:', tutorError);
    }

    // Fetch profiles (email, phone,location)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, phone, address')
      .in('id', tutorIds);

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
    }

    // Create lookup maps
    const tutorProfileMap = {};
    const profileMap = {};

    if (tutorProfiles) {
      tutorProfiles.forEach(tutor => {
        tutorProfileMap[tutor.user_id] = tutor;
      });
    }

    if (profiles) {
      profiles.forEach(profile => {
        profileMap[profile.id] = profile;
      });
    }

    // Combine data
    const formattedRequests = requests.map(req => ({
      ...req,
      tutor: {
        user_id: req.tutor_id,
        first_name: tutorProfileMap[req.tutor_id]?.first_name || 'Unknown',
        last_name: tutorProfileMap[req.tutor_id]?.last_name || '',
        ssc_result: tutorProfileMap[req.tutor_id]?.ssc_result || 'N/A',
        hsc_result: tutorProfileMap[req.tutor_id]?.hsc_result || 'N/A',
        email: profileMap[req.tutor_id]?.email || 'N/A',
        phone: profileMap[req.tutor_id]?.phone || 'N/A',
        address: profileMap[req.tutor_id]?.address || 'N/A',

      }
    }));
    
    res.json({
      success: true,
      requests: formattedRequests,
      message: `${formattedRequests.length} requests found`
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;