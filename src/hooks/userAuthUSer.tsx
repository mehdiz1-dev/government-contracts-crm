'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            const { data, error } = await supabase.auth.getUser()

            if (error) {
                console.log('Supabase user fetch error:', error)
                setError(error.message)
                setUser(null)
            } else {
                setUser(data.user)
                setError(null)
            }

            setLoading(false)
        }

        fetchUser()
    }, [])

    return { user, loading, error }
}
