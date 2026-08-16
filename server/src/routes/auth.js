import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// Server-side login (alternative to client-side Supabase auth)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return res.status(401).json({ error: error.message })
    res.json({
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Server-side signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    })

    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json({
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' })
  }
})

// Refresh session
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    })

    if (error) return res.status(401).json({ error: error.message })
    res.json({ session: data.session })
  } catch (err) {
    res.status(500).json({ error: 'Refresh failed' })
  }
})

export default router
