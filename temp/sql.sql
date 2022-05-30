SELECT DISTINCT
	( left_dev_id ),
	left_dev_ip,
	left_dev_name,
	left_prov_aid,
	left_city_aid,
	left_dev_net,
	left_dev_type,
	left_dev_role,
	right_dev_id,
	right_dev_ip,
	right_dev_name,
	right_prov_aid,
	right_city_aid,
	right_dev_net,
	right_dev_type,
	right_dev_role 
FROM
	tbl_rsingplat_ex_link 
WHERE
	left_dev_id IN (
	SELECT
		dev_id 
	FROM
		tbl_rsingplat_ex_dev 
	WHERE
		( dev_net = 1 AND dev_type = 4 ) 
		OR ( dev_net = 4 AND dev_type = 16 ) 
		OR ( dev_net = 4 AND dev_type = 17 ) 
		OR ( dev_net = 8 AND dev_type = 35 ) 
	) 
	AND right_dev_id IN (
	SELECT
		dev_id 
	FROM
		tbl_rsingplat_ex_dev 
	WHERE
		( dev_net = 1 AND dev_type = 4 ) 
		OR ( dev_net = 4 AND dev_type = 16 ) 
		OR ( dev_net = 4 AND dev_type = 17 ) 
		OR ( dev_net = 8 AND dev_type = 35 ) 
	) 
	AND time = "2021-07-06 18:22:00" 
ORDER BY
	right_dev_id,
	left_dev_id