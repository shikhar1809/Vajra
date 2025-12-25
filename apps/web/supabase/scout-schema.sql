-- Scout Financial Document Tables

-- Financial documents table
CREATE TABLE IF NOT EXISTS financial_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    extracted_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT,
    category TEXT,
    total_spend DECIMAL(12, 2) DEFAULT 0,
    risk_score INTEGER DEFAULT 0, -- 0-100
    security_rating TEXT, -- A, B, C, D, F
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor transactions table
CREATE TABLE IF NOT EXISTS vendor_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_date DATE,
    description TEXT,
    document_id UUID REFERENCES financial_documents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_documents_user_id ON financial_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_documents_status ON financial_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_normalized_name ON vendors(normalized_name);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_vendor_id ON vendor_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_transactions_user_id ON vendor_transactions(user_id);

-- Row Level Security (RLS)
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own financial documents"
    ON financial_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial documents"
    ON financial_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial documents"
    ON financial_documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial documents"
    ON financial_documents FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own vendors"
    ON vendors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendors"
    ON vendors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors"
    ON vendors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors"
    ON vendors FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own vendor transactions"
    ON vendor_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendor transactions"
    ON vendor_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor transactions"
    ON vendor_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Storage bucket for financial documents (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('financial-documents', 'financial-documents', false);

-- Storage policies
-- CREATE POLICY "Users can upload their own financial documents"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own financial documents"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own financial documents"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'financial-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
