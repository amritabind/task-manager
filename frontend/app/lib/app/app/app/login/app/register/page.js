'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/axios';
import { useRouter } from 'next/navigation';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Register</h2>
        <input {...register('name')} placeholder="Name" className="border p-2 mb-2 w-full" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        <input {...register('email')} placeholder="Email" className="border p-2 mb-2 w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <input {...register('password')} type="password" placeholder="Password" className="border p-2 mb-2 w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Register</button>
        <p className="mt-2">Have account? <a href="/login" className="text-blue-500">Login</a></p>
      </form>
    </div>
  );
}