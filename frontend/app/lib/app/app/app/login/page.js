'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/axios';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Login</h2>
        <input {...register('email')} placeholder="Email" className="border p-2 mb-2 w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input {...register('password')} type="password" placeholder="Password" className="border p-2 mb-2 w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Login</button>
        <p className="mt-2">No account? <a href="/register" className="text-blue-500">Register</a></p>
      </form>
    </div>
  );
}