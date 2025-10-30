const express = require('express');
const router = express.Router();
const supabase = require('../supabaseConfig');

// Submit tutor application
router.post('/apply', async (req, res) => {
  const { 
    userId, firstName, lastName, 
    sscResult, sscDept, hscResult, hscDept,
    honoursResult, honoursInst, honoursDept,
    mastersResult, mastersInst, mastersDept,
    bio,
    profilePicUrl, institutionIdUrl, nidUrl // Image URLs
  } = req.body;
  
  try {
    // Check if already applied
    const { data: existing } = await supabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to become a tutor'
      });
    }
    
    // Insert tutor profile with images
    const { error } = await supabase.from('tutor_profiles').insert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      ssc_result: sscResult,
      ssc_department: sscDept,
      hsc_result: hscResult,
      hsc_department: hscDept,
      honours_result: honoursResult,
      honours_institution: honoursInst,
      honours_department: honoursDept,
      masters_result: mastersResult,
      masters_institution: mastersInst,
      masters_department: mastersDept,
      bio: bio,
      profile_picture_url: profilePicUrl,
      institution_id_url: institutionIdUrl,
      nid_url: nidUrl,
      verification_status: 'pending'
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Tutor application submitted successfully!'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ------------------------------------------------------------------------------------------------




// Get all verified tutors
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles!tutor_profiles_user_id_fkey(email, phone, full_name,address)
      `)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Flatten the data structure
    const tutors = data.map(tutor => ({
      ...tutor,
      email: tutor.profiles.email,
      phone: tutor.profiles.phone,
      full_name: tutor.profiles.full_name,
      address:tutor.profiles.address
    }));
    
    res.json({
      success: true,
      tutors: tutors,
      message: `${tutors.length} tutors found`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single tutor details
router.get('/details/:tutorId', async (req, res) => {
  const { tutorId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles!tutor_profiles_user_id_fkey(email, phone, full_name, address)
      `)
      .eq('user_id', tutorId)
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Flatten the data
    const tutor = {
      ...data,
      email: data.profiles.email,
      phone: data.profiles.phone,
      full_name: data.profiles.full_name,
      address:data.profiles.address
    };
    
    res.json({
      success: true,
      tutor: tutor
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get own tutor profile
router.get('/my-profile/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Tutor profile not found'
      });
    }
    
    res.json({
      success: true,
      tutorProfile: data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update tutor profile
router.put('/update-profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const {
    firstName, lastName,
    sscResult, sscDept,
    hscResult, hscDept,
    honoursResult, honoursInst, honoursDept,
    mastersResult, mastersInst, mastersDept,
    bio,
    profilePicUrl
  } = req.body;
  
  try {
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      ssc_result: sscResult,
      ssc_department: sscDept,
      hsc_result: hscResult,
      hsc_department: hscDept,
      honours_result: honoursResult,
      honours_institution: honoursInst,
      honours_department: honoursDept,
      masters_result: mastersResult,
      masters_institution: mastersInst,
      masters_department: mastersDept,
      bio: bio
    };
    // যদি নতুন profile picture থাকে তাহলে add করুন
    if (profilePicUrl) {
      updateData.profile_picture_url = profilePicUrl;
    }

    const { error } = await supabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('user_id', userId);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Tutor profile updated successfully!'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ Admin Routes - Tutor Documents Verification ============
// Get tutor documents for admin verification - Admin panel এর জন্য tutor documents fetch করার route
router.get('/admin/documents/:tutorId', async (req, res) => {
  const { tutorId } = req.params;
  
  try {
    // Fetch tutor profile with institution ID and NID URLs
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        institution_id_url,
        nid_url,
        verification_status,
        profiles!tutor_profiles_user_id_fkey(full_name, email, phone)
      `)
      .eq('id', tutorId)
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Format response with tutor details and document URLs
    const tutorDocuments = {
      id: data.id,
      user_id: data.user_id,
      tutor_name: `${data.first_name} ${data.last_name}`,
      full_name: data.profiles.full_name,
      email: data.profiles.email,
      phone: data.profiles.phone,
      institution_id_url: data.institution_id_url,
      nid_url: data.nid_url,
      verification_status: data.verification_status
    };
    
    res.json({
      success: true,
      documents: tutorDocuments
    });
    
  } catch (error) {
    console.error('Get tutor documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all tutors with documents - Admin panel এর জন্য সব tutors এর documents সহ fetch করার route
router.get('/admin/all-with-documents', async (req, res) => {
  try {
    // Fetch all tutor profiles with their documents
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        institution_id_url,
        nid_url,
        verification_status,
        created_at,
        profiles!tutor_profiles_user_id_fkey(full_name, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Format response with all tutor documents
    const tutorsWithDocuments = data.map(tutor => ({
      id: tutor.id,
      user_id: tutor.user_id,
      tutor_name: `${tutor.first_name} ${tutor.last_name}`,
      full_name: tutor.profiles.full_name,
      email: tutor.profiles.email,
      phone: tutor.profiles.phone,
      institution_id_url: tutor.institution_id_url,
      nid_url: tutor.nid_url,
      verification_status: tutor.verification_status,
      created_at: tutor.created_at
    }));
    
    res.json({
      success: true,
      tutors: tutorsWithDocuments,
      message: `${tutorsWithDocuments.length} tutors found with documents`
    });
    
  } catch (error) {
    console.error('Get all tutors with documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
module.exports = router;