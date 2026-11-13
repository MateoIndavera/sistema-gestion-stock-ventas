require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.URLSUPABASE, process.env.ANONKEY);

module.exports = { supabase };
