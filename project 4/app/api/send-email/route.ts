import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: 'witcher.mxrouting.net',
  port: 465,
  secure: true,
  auth: {
    user: 'info@bibliotek.com',
    pass: 'LMDSjmbe0825',
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    const mailOptions = {
      from: 'info@bibliotek.com',
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo' },
      { status: 500 }
    );
  }
} 