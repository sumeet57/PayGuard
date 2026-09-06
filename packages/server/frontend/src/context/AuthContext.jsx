// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false }
    case 'LOGOUT':
      return { ...initialState, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      dispatch({ type: 'SET_USER', payload: null })
      return
    }

    try {
      const res = await authAPI.me()
      dispatch({ type: 'SET_USER', payload: res.data.user })
    } catch {
      localStorage.removeItem('token')
      dispatch({ type: 'SET_USER', payload: null })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }
    dispatch({ type: 'SET_USER', payload: res.data.user })
    return res.data
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }
    dispatch({ type: 'SET_USER', payload: res.data.user })
    return res.data
  }

  const googleLogin = async (accessToken) => {
    const res = await authAPI.googleAuth(accessToken)
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
    }
    dispatch({ type: 'SET_USER', payload: res.data.user })
    return res.data
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const updateUser = (userData) => dispatch({ type: 'SET_USER', payload: userData })

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}