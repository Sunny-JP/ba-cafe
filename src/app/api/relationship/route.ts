import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://rabbit1.cc',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: relationships, error } = await supabase
      .from('relationship')
      .select('id, char_key, bond_level, recorded_at')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(relationships || []);
  } catch (error: any) {
    console.error("GET API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { char_key, bond_level, recorded_at } = body;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: existingRecord, error: checkError } = await supabase
      .from('relationship')
      .select('id')
      .eq('user_id', user.id)
      .eq('char_key', char_key)
      .eq('bond_level', bond_level)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingRecord) {
      return NextResponse.json(
        { error: `RANK ${bond_level} は既に登録されています。` }, 
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('relationship')
      .insert({
        user_id: user.id,
        char_key,
        bond_level,
        recorded_at
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('relationship')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}