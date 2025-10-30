const express = require('express');
const router = express.Router();
const supabase = require('../supabaseConfig');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route Working' });
});

// Login route 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Login successful ',
      user: data.user 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, gender, role, address } = req.body;
  
  console.log('Registration attempt for:', email);
  
  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please login.' 
      });
    }

    // Create user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:5173/login',
      },
    });

    if (signUpError) {
      return res.status(400).json({ 
        success: false, 
        message: signUpError.message 
      });
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      phone: phone,
      gender: gender,
      role: role,
      address: address
    });

    if (profileError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration failed: ' + profileError.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Check your email to verify account.' 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});



// Profile route 
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      profile: profileData 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update profile route 
router.put('/update-profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fullName, phone, address, gender, role } = req.body;
  
  try {


    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        address: address,
        gender: gender,
        role: role
      })
      .eq('id', userId);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully!' 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update user role
router.put('/update-role/:userId', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  try {
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
      message: 'Role updated successfully!'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update profile picture
router.put('/update-profile-picture/:userId', async (req, res) => {
  const { userId } = req.params;
  const { profilePictureUrl } = req.body;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ profile_picture_url: profilePictureUrl })
      .eq('id', userId);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully!'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

