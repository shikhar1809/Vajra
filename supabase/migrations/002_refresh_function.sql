-- Function to refresh workspace metrics materialized view
CREATE OR REPLACE FUNCTION refresh_workspace_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY workspace_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION refresh_workspace_metrics() TO authenticated;
