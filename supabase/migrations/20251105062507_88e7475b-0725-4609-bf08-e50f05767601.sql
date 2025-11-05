-- Add database constraints for validation
ALTER TABLE profiles 
  ADD CONSTRAINT valid_age CHECK (age >= 13 AND age <= 120),
  ADD CONSTRAINT valid_height CHECK (height_cm >= 50 AND height_cm <= 300),
  ADD CONSTRAINT valid_current_weight CHECK (current_weight_kg >= 20 AND current_weight_kg <= 500),
  ADD CONSTRAINT valid_goal_weight CHECK (goal_weight_kg >= 20 AND goal_weight_kg <= 500);

ALTER TABLE weight_logs 
  ADD CONSTRAINT valid_weight CHECK (weight_kg >= 20 AND weight_kg <= 500);

ALTER TABLE chat_messages 
  ADD CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'));

-- Create API usage tracking table for rate limiting
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request TIMESTAMPTZ NOT NULL DEFAULT now(),
  daily_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_api_usage_user_function ON public.api_usage(user_id, function_name);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_usage
CREATE POLICY "Users can view own API usage"
  ON public.api_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API usage"
  ON public.api_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API usage"
  ON public.api_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _function_name TEXT,
  _daily_limit INTEGER DEFAULT 100
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage RECORD;
  v_requests_today INTEGER;
BEGIN
  -- Get current usage for today
  SELECT * INTO v_usage
  FROM public.api_usage
  WHERE user_id = _user_id 
    AND function_name = _function_name
    AND last_request::date = CURRENT_DATE;
  
  IF v_usage IS NULL THEN
    -- First request today, create record
    INSERT INTO public.api_usage (user_id, function_name, request_count, daily_limit)
    VALUES (_user_id, _function_name, 1, _daily_limit);
    RETURN true;
  ELSE
    -- Check if limit exceeded
    IF v_usage.request_count >= v_usage.daily_limit THEN
      RETURN false;
    END IF;
    
    -- Increment counter
    UPDATE public.api_usage
    SET request_count = request_count + 1,
        last_request = now(),
        updated_at = now()
    WHERE id = v_usage.id;
    
    RETURN true;
  END IF;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_api_usage_updated_at
  BEFORE UPDATE ON public.api_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();