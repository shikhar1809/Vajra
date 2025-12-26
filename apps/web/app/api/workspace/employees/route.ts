import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// POST - Add new employee to workspace
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workspaceId, name, email, department, location } = body;

        if (!workspaceId || !name || !email) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID, name, and email are required' },
                { status: 400 }
            );
        }

        // Insert employee
        const { data: employee, error } = await supabase
            .from('employees')
            .insert({
                workspace_id: workspaceId,
                name,
                email,
                department,
                location,
                security_score: 50, // Default score
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating employee:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: employee,
        });
    } catch (error) {
        console.error('Employee creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create employee' },
            { status: 500 }
        );
    }
}

// GET - Get all employees for workspace
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json(
                { success: false, error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        if (!supabase) return NextResponse.json({ success: true, data: [] });

        const { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('security_score', { ascending: false });

        if (error) {
            console.error('Error fetching employees:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { employees: employees || [] },
        });
    } catch (error) {
        console.error('Employees GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}
