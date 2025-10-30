const express = require('express');
const router = express.Router();
const supabase = require('../supabaseConfig');

// Get admin dashboard statistics - Admin dashboard এর জন্য সব stats fetch করা হচ্ছে
router.get('/stats', async (req, res) => {
  try {
    // Total users count - সব users এর count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Total tutors count - সব tutors এর count
    const { count: totalTutors } = await supabase
      .from('tutor_profiles')
      .select('*', { count: 'exact', head: true });

    // Pending tutors count - যে tutors এর verification pending আছে
    const { count: pendingTutors } = await supabase
      .from('tutor_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending');

    // Total posts count - সব tuition posts এর count
    const { count: totalPosts } = await supabase
      .from('tuition_posts')
      .select('*', { count: 'exact', head: true });

    // Total applications count - সব applications এর count
    const { count: totalApplications } = await supabase
      .from('contact_applications')
      .select('*', { count: 'exact', head: true });

    // Pending posts count - যে posts এর approval pending আছে (নতুন field)
    const { count: pendingPosts } = await supabase
      .from('tuition_posts')
      .select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending');

    // Response পাঠানো হচ্ছে সব stats সহ
    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalTutors: totalTutors || 0,
        pendingTutors: pendingTutors || 0,
        totalPosts: totalPosts || 0,
        totalApplications: totalApplications || 0,
        pendingPosts: pendingPosts || 0  
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ Tutor Management Routes ============

// Get all tutors - সব tutors fetch করার route 
router.get('/tutors/all', async (req, res) => {
  try {
    // Tutors এবং তাদের profile info একসাথে fetch করা হচ্ছে
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles!tutor_profiles_user_id_fkey(email, phone, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Profile data কে tutor data এর সাথে merge করা হচ্ছে
    const tutors = data.map(tutor => ({
      ...tutor,
      email: tutor.profiles.email,
      phone: tutor.profiles.phone,
      full_name: tutor.profiles.full_name
    }));

    res.json({
      success: true,
      tutors: tutors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get tutors by verification status - Status filter অনুযায়ী tutors fetch করা (pending, approved, rejected)
router.get('/tutors/:status', async (req, res) => {
  const { status } = req.params;
  
  try {
    // Specific status এর tutors fetch করা হচ্ছে
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles!tutor_profiles_user_id_fkey(email, phone, full_name)
      `)
      .eq('verification_status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Profile data merge করা হচ্ছে
    const tutors = data.map(tutor => ({
      ...tutor,
      email: tutor.profiles.email,
      phone: tutor.profiles.phone,
      full_name: tutor.profiles.full_name
    }));

    res.json({
      success: true,
      tutors: tutors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update tutor verification status - Tutor কে approve/reject করার route
router.put('/tutors/verify/:tutorId', async (req, res) => {
  const { tutorId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  
  try {
    // Tutor এর verification status update করা হচ্ছে
    const { error } = await supabase
      .from('tutor_profiles')
      .update({ verification_status: status })
      .eq('id', tutorId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: `Tutor ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ User Management Routes ============

// Get all users - সব registered users fetch করার route
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
      // .order('created_at', { ascending: false }); // Commented out - order করা হয়নি

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      users: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete user - User delete করার route
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // User profile delete করা হচ্ছে (cascade delete automatically related records handle করবে)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user role - User এর role change করার route (student/tutor/admin)
router.put('/users/:userId/role', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  try {
    // User এর role update করা হচ্ছে
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ Post Management Routes (Old - শুধু approved posts দেখানোর জন্য) ============

// Get all posts with owner details - সব posts fetch করা owner info সহ
router.get('/posts', async (req, res) => {
  try {
    // Get all posts
    const { data: posts, error: postsError } = await supabase
      .from('tuition_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Get posts error:', postsError);
      return res.status(400).json({
        success: false,
        message: postsError.message
      });
    }

    // Get all unique user IDs - সব posts এর owners এর IDs collect করা হচ্ছে
    const userIds = [...new Set(posts.map(post => post.user_id))];

    // Fetch all owners in one query - একসাথে সব owners fetch করা হচ্ছে (optimized)
    const { data: owners, error: ownersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds);

    if (ownersError) {
      console.error('Get owners error:', ownersError);
    }

    // Create owner lookup map - Owner data কে map এ convert করা হচ্ছে fast lookup এর জন্য
    const ownerMap = {};
    if (owners) {
      owners.forEach(owner => {
        ownerMap[owner.id] = owner;
      });
    }

    // Combine posts with owner data - Posts এর সাথে owner info merge করা হচ্ছে
    const postsWithOwners = posts.map(post => ({
      ...post,
      owner_name: ownerMap[post.user_id]?.full_name || 'Unknown',
      owner_email: ownerMap[post.user_id]?.email || 'Unknown',
      owner_phone: ownerMap[post.user_id]?.phone || 'Unknown'
    }));

    res.json({
      success: true,
      posts: postsWithOwners
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete post - Post delete করার route
router.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  
  try {
    const { error } = await supabase
      .from('tuition_posts')
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
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ Post Approval Routes (New - Post approval system এর জন্য) ============

// Get posts by approval status - Filter অনুযায়ী posts fetch করার route (pending, approved, rejected)
router.get('/posts/status/:status', async (req, res) => {
  const { status } = req.params;
  
  try {
    // Specific status এর posts fetch করা হচ্ছে
    const { data: posts, error: postsError } = await supabase
      .from('tuition_posts')
      .select('*')
      .eq('approval_status', status)
      .order('created_at', { ascending: false });

    if (postsError) {
      return res.status(400).json({
        success: false,
        message: postsError.message
      });
    }

    // Owner details fetch করা হচ্ছে
    const userIds = [...new Set(posts.map(post => post.user_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds);

    // Owner lookup map তৈরি করা হচ্ছে
    const ownerMap = {};
    if (owners) {
      owners.forEach(owner => {
        ownerMap[owner.id] = owner;
      });
    }

    // Posts এর সাথে owner data combine করা হচ্ছে
    const postsWithOwners = posts.map(post => ({
      ...post,
      owner_name: ownerMap[post.user_id]?.full_name || 'Unknown',
      owner_email: ownerMap[post.user_id]?.email || 'Unknown',
      owner_phone: ownerMap[post.user_id]?.phone || 'Unknown'
    }));

    res.json({
      success: true,
      posts: postsWithOwners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all posts regardless of status - All filter এর জন্য route (status নির্বিশেষে সব posts)
router.get('/posts/all-status', async (req, res) => {
  try {
    // সব posts fetch করা হচ্ছে
    const { data: posts, error: postsError } = await supabase
      .from('tuition_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      return res.status(400).json({
        success: false,
        message: postsError.message
      });
    }

    // Owner details fetch করা হচ্ছে
    const userIds = [...new Set(posts.map(post => post.user_id))];
    const { data: owners } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds);

    // Owner lookup map
    const ownerMap = {};
    if (owners) {
      owners.forEach(owner => {
        ownerMap[owner.id] = owner;
      });
    }

    // Posts + owner data merge
    const postsWithOwners = posts.map(post => ({
      ...post,
      owner_name: ownerMap[post.user_id]?.full_name || 'Unknown',
      owner_email: ownerMap[post.user_id]?.email || 'Unknown',
      owner_phone: ownerMap[post.user_id]?.phone || 'Unknown'
    }));

    res.json({
      success: true,
      posts: postsWithOwners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Approve/Reject post - Admin post approve/reject করার route
router.put('/posts/approve/:postId', async (req, res) => {
  const { postId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  
  try {
    // Post এর approval status update করা হচ্ছে
    const { error } = await supabase
      .from('tuition_posts')
      .update({ 
        is_approved: status === 'approved',  // approved হলে true, না হলে false
        approval_status: status  // 'approved' or 'rejected'
      })
      .eq('id', postId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: `Post ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;