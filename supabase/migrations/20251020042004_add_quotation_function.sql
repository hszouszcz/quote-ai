-- Function to create quotation with related data in a single transaction
CREATE OR REPLACE FUNCTION create_quotation_with_relations(
  p_user_id UUID,
  p_estimation_type TEXT,
  p_scope TEXT,
  p_man_days INTEGER,
  p_buffer INTEGER,
  p_dynamic_attributes JSONB,
  p_platforms UUID[],
  p_tasks JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quotation_id UUID;
  v_quotation RECORD;
  v_task JSONB;
  v_platform UUID;
  v_result JSONB;
  v_tasks JSONB[] := '{}';
  v_platforms UUID[] := '{}';
BEGIN
  -- Start transaction (implicit in function)
  
  -- Validate input parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF p_estimation_type NOT IN ('Fixed Price', 'Time & Material') THEN
    RAISE EXCEPTION 'Invalid estimation type. Must be "Fixed Price" or "Time & Material"';
  END IF;
  
  IF array_length(p_platforms, 1) IS NULL OR array_length(p_platforms, 1) = 0 THEN
    RAISE EXCEPTION 'At least one platform must be selected';
  END IF;
  
  IF array_length(p_tasks, 1) IS NULL OR array_length(p_tasks, 1) = 0 THEN
    RAISE EXCEPTION 'At least one task must be provided';
  END IF;
  
  -- Create the main quotation record
  INSERT INTO quotations (
    user_id,
    estimation_type,
    scope,
    man_days,
    buffer,
    dynamic_attributes,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_estimation_type,
    p_scope,
    p_man_days,
    p_buffer,
    p_dynamic_attributes,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_quotation_id;
  
  -- Insert platforms
  FOREACH v_platform IN ARRAY p_platforms
  LOOP
    INSERT INTO quotation_platforms (quotation_id, platform_id)
    VALUES (v_quotation_id, v_platform);
    
    v_platforms := v_platforms || v_platform;
  END LOOP;
  
  -- Insert tasks
  FOREACH v_task IN ARRAY p_tasks
  LOOP
    INSERT INTO quotation_tasks (
      quotation_id,
      task_description,
      man_days,
      created_at
    )
    VALUES (
      v_quotation_id,
      (v_task->>'description')::TEXT,
      (v_task->>'man_days')::INTEGER,
      NOW()
    );
    
    -- Build tasks array for response
    v_tasks := v_tasks || jsonb_build_object(
      'quotation_id', v_quotation_id,
      'description', v_task->>'description',
      'man_days', (v_task->>'man_days')::INTEGER,
      'created_at', NOW()
    );
  END LOOP;
  
  -- Get the created quotation
  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = v_quotation_id;
  
  -- Build the response JSON
  v_result := jsonb_build_object(
    'id', v_quotation.id,
    'user_id', v_quotation.user_id,
    'estimation_type', v_quotation.estimation_type,
    'scope', v_quotation.scope,
    'man_days', v_quotation.man_days,
    'buffer', v_quotation.buffer,
    'dynamic_attributes', v_quotation.dynamic_attributes,
    'created_at', v_quotation.created_at,
    'updated_at', v_quotation.updated_at,
    'platforms', to_jsonb(v_platforms),
    'tasks', to_jsonb(v_tasks)
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (if you have a logging system)
    RAISE EXCEPTION 'Failed to create quotation: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_quotation_with_relations TO authenticated;
