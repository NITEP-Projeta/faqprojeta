import axios from 'axios'

console.log('👉 API URL carregada:', process.env.NEXT_PUBLIC_API_URL)

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export default api
