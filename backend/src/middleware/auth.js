const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Create a scoped client for this specific user's token
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Verify token and get user info
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) throw new Error('Invalid token');

    // Attach to request so routes can use it
    req.userClient = userClient;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized: ' + err.message });
  }
};

module.exports = authenticateUser;
