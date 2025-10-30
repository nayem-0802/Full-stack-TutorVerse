const express = require('express');
const router = express.Router();
const supabase = require('../supabaseConfig');

// Post tuition or creation route - 
router.post('/create', async (req, res) => {
  const { classLevel, group, subject, salary, gender, location, requirement, userId, studentIdCardUrl } = req.body; // userId add
  
  try {

    const { data, error } = await supabase.from("tuition_posts").insert([
      {
        user_id: userId,  
        class_level: classLevel,
        subject: subject,
        salary: salary,
        group: group,
        gender: gender,
        location: location,
        requirement: requirement,
        student_id_card_url: studentIdCardUrl,  
        is_approved: false, 
        approval_status: 'pending'
      },
    ]);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Post submitted for admin approval!'  
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all posts route - only approved posts fetch 
router.get('/all', async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("tuition_posts")
      .select('*')
      .eq('is_approved', true)  // শুধু approved posts fetch করা হচ্ছে
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      posts: data,
      message: `${data.length} posts found`
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user's posts route - User এর নিজের সব posts fetch করার route (সব status সহ)
router.get('/my-posts/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {

    const { data, error } = await supabase
      .from("tuition_posts")
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      posts: data,
      message: `${data.length} posts found for user`
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete post route - Post delete করার route 
router.delete('/delete/:postId/:userId', async (req, res) => {
  const { postId, userId } = req.params;
  
  try {
    // Check if post belongs to user - Post এই user এর কিনা check করা হচ্ছে
    const { data: postData, error: fetchError } = await supabase
      .from("tuition_posts")
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError || !postData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    if (postData.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own posts' 
      });
    }

    // Delete the post
    const { error } = await supabase
      .from("tuition_posts")
      .delete()
      .eq('id', postId);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Post deleted successfully!' 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get single post for editing - Edit করার জন্য post fetch করার route 
router.get('/edit/:postId/:userId', async (req, res) => {
  const { postId, userId } = req.params;
  
  try {

    const { data, error } = await supabase
      .from("tuition_posts")
      .select('*')  
      .eq('id', postId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    res.json({ 
      success: true, 
      post: data  
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update post - Post edit করার route and re-approval system add করা হয়েছে)
router.put('/update/:postId/:userId', async (req, res) => {
  const { postId, userId } = req.params;
  const { 
    classLevel, group, subject, salary, gender, location, requirement,
    studentIdCardUrl  
  } = req.body;
  
  try {
    // Verify ownership - Check করা হচ্ছে post টা এই user এর কিনা
    const { data: existingPost, error: fetchError } = await supabase
      .from('tuition_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (existingPost.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this post'
      });
    }

    // Update post এবং approval status reset করা হচ্ছে
    const { data, error } = await supabase
      .from("tuition_posts")
      .update({
        class_level: classLevel,
        group: group,
        subject: subject,
        salary: salary,
        gender: gender,
        location: location,
        requirement: requirement,
        student_id_card_url: studentIdCardUrl,  
        is_approved: false,  
        approval_status: 'pending'  // Re-approval এর জন্য pending set করা হচ্ছে
      })
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Post updated successfully and sent for admin approval!'  
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Apply to post route - Post এ apply করার route
router.post('/apply/:postId', async (req, res) => {
  const { postId } = req.params;
  const { applicantId, message } = req.body;
  
  try {
    const supabase = require('../supabaseConfig');
    
    // Get post owner ID - Post এর owner এর ID fetch করা হচ্ছে
    const { data: postData, error: postError } = await supabase
      .from('tuition_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (postError || !postData) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already applied - আগে apply করেছে কিনা check করা হচ্ছে
    const { data: existingApplication } = await supabase
      .from('contact_applications')
      .select('id')
      .eq('post_id', postId)
      .eq('applicant_id', applicantId)
      .single();

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this post'
      });
    }

    // Create application - নতুন application create করা হচ্ছে
    const { data, error } = await supabase
      .from('contact_applications')
      .insert([{
        post_id: postId,
        applicant_id: applicantId,
        post_owner_id: postData.user_id,
        message: message
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
      message: 'Application submitted successfully!',
      application: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get applications for user's posts - User এর posts এ আসা applications fetch করার route
router.get('/applications/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const supabase = require('../supabaseConfig');
    
    const { data, error } = await supabase
      .from('contact_applications')
      .select(`
        id, message, status, created_at,
        post:tuition_posts(id, class_level, subject, salary, location),
        applicant:profiles!contact_applications_applicant_id_fkey(full_name, email, phone)
      `)
      .eq('post_owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      applications: data,
      message: `${data.length} applications found`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update application status - Application accept/reject করার route
router.put('/applications/:applicationId/status', async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  try {
    const supabase = require('../supabaseConfig');
    
    // Get application details
    const { data: application } = await supabase
      .from('contact_applications')
      .select('post_id, applicant_id')
      .eq('id', applicationId)
      .single();
    
    // Update application status
    const { data, error } = await supabase
      .from('contact_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // যদি accept করা হয় তাহলে post টা book করুন
    if (status === 'accepted' && application) {
      await supabase
        .from('tuition_posts')
        .update({ 
          is_booked: true,
          booked_by: application.applicant_id 
        })
        .eq('id', application.post_id);
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application: data
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get applications made by the user (where user is applicant) - User যে posts এ apply করেছে সেগুলো fetch করার route
router.get('/my-applications/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const supabase = require('../supabaseConfig');
    
    const { data, error } = await supabase
      .from('contact_applications')
      .select(`
        id, message, status, created_at,
        post:tuition_posts(id, class_level, subject, salary, location),
        owner:profiles!contact_applications_post_owner_id_fkey(full_name, email, phone)
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      applications: data,
      message: `${data.length} applications found`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Check if user has already applied to a post - User post এ apply করেছে কিনা check করার route
router.get('/check-application/:postId/:userId', async (req, res) => {
  const { postId, userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('contact_applications')
      .select('id, status')
      .eq('post_id', postId)
      .eq('applicant_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      hasApplied: !!data,
      applicationStatus: data?.status || null
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
module.exports = router;