-- Create admin RPC functions for bot_questions (SECURITY DEFINER, password-protected)

CREATE OR REPLACE FUNCTION public.admin_save_bot_question(
  p_password text,
  p_question json
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT password_hash INTO v_hash FROM admin_settings LIMIT 1;
  IF v_hash IS NULL OR p_password IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF (p_question->>'id')::text = '' THEN
    INSERT INTO bot_questions (question_ar, question_en, answer_ar, answer_en, display_order, is_active)
    VALUES (
      p_question->>'question_ar',
      p_question->>'question_en',
      p_question->>'answer_ar',
      p_question->>'answer_en',
      COALESCE((p_question->>'display_order')::int, 1),
      COALESCE((p_question->>'is_active')::boolean, true)
    );
  ELSE
    UPDATE bot_questions SET
      question_ar = p_question->>'question_ar',
      question_en = p_question->>'question_en',
      answer_ar = p_question->>'answer_ar',
      answer_en = p_question->>'answer_en',
      display_order = COALESCE((p_question->>'display_order')::int, 1),
      is_active = COALESCE((p_question->>'is_active')::boolean, true)
    WHERE id = (p_question->>'id')::uuid;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_bot_question(
  p_password text,
  p_question_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT password_hash INTO v_hash FROM admin_settings LIMIT 1;
  IF v_hash IS NULL OR p_password IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM bot_questions WHERE id = p_question_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reorder_bot_question(
  p_password text,
  p_question_id uuid,
  p_new_order int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT password_hash INTO v_hash FROM admin_settings LIMIT 1;
  IF v_hash IS NULL OR p_password IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE bot_questions SET display_order = p_new_order WHERE id = p_question_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toggle_bot_question(
  p_password text,
  p_question_id uuid,
  p_is_active boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT password_hash INTO v_hash FROM admin_settings LIMIT 1;
  IF v_hash IS NULL OR p_password IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE bot_questions SET is_active = p_is_active WHERE id = p_question_id;
  RETURN true;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.admin_save_bot_question(text, json) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_bot_question(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reorder_bot_question(text, uuid, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_bot_question(text, uuid, boolean) TO anon, authenticated;
