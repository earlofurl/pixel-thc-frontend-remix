export type Account = {
	id: number
	owner: string
	balance: number
	currency: string
	created_at: string
}

export type Entry = {
	id: number
	account_id: number
	amount: number
	created_at: string
}

export type Item = {
	id: number
	created_at: string
	updated_at: string
	description: string
	is_used: boolean
	item_type_id: number
	strain_id: number
	strain_name: string
	product_form: string
	product_modifier: string
}

export type ItemType = {
	id: number
	created_at: string
	updated_at: string
	product_form: string
	product_modifier: string
	uom_default: number
	product_category_id: number
}

export type LabTest = {
	id: number
	created_at: string
	updated_at: string
	test_name: string
	batch_code: string
	test_id_code: string
	lab_facility_name: string
	test_performed_date_time: string
	test_completed: boolean
	overall_passed: boolean
	test_type_name: string
	test_passed: boolean
	test_comment: string
	thc_total_percent: number
	thc_total_value: number
	cbd_percent: number
	cbd_value: number
	terpene_total_percent: number
	terpene_total_value: number
	thc_a_percent: number
	thc_a_value: number
	delta9_thc_percent: number
	delta9_thc_value: number
	delta8_thc_percent: number
	delta8_thc_value: number
	thc_v_percent: number
	thc_v_value: number
	cbd_a_percent: number
	cbd_a_value: number
	cbn_percent: number
	cbn_value: number
	cbg_a_percent: number
	cbg_a_value: number
	cbg_percent: number
	cbg_value: number
	cbc_percent: number
	cbc_value: number
	total_cannabinoid_percent: number
	total_cannabinoid_value: number
}

export type Order = {
	id: number
	created_at: string
	updated_at: string
	scheduled_pack_date_time: string
	scheduled_ship_date_time: string
	scheduled_delivery_date_time: string
	actual_pack_date_time: string
	actual_ship_date_time: string
	actual_delivery_date_time: string
	order_total: number
	notes: string
	status: string
	customer_name: string
}

export type Package = {
	id: number
	created_at: string
	updated_at: string
	tag_id: number
	package_type: string
	is_active: boolean
	quantity: number
	notes: string
	packaged_date_time: string
	harvest_date_time: string
	lab_testing_state: string
	lab_testing_state_date_time: string
	is_trade_sample: boolean
	is_testing_sample: boolean
	product_requires_remediation: boolean
	contains_remediated_product: boolean
	remediation_date_time: string
	received_date_time: string
	received_from_manifest_number: string
	received_from_facility_license_number: string
	received_from_facility_name: string
	is_on_hold: boolean
	archived_date: string
	finished_date: string
	item_id: number
	provisional_label: string
	is_provisional: boolean
	is_sold: boolean
	ppu_default: number
	ppu_on_order: number
	total_package_price_on_order: number
	ppu_sold_price: number
	total_sold_price: number
	packaging_supplies_consumed: boolean
	is_line_item: boolean
	order_id: number
	uom_id: number
}

export type PackageTag = {
	id: number
	created_at: string
	updated_at: string
	tag_number: string
	is_assigned: boolean
	is_provisional: boolean
	is_active: boolean
	assigned_package_id: number
}

export type ProductCategory = {
	id: number
	name: string
	created_at: string
	updated_at: string
}

export type RetailerLocation = {
	id: number
	created_at: string
	updated_at: string
	name: string
	address: string
	city: string
	state: string
	zip: string
	latitude: number
	longitude: number
	note: string
	website: string
	sells_flower: boolean
	sells_prerolls: boolean
	sells_pressed_hash: boolean
	created_by: string
}

export type Strain = {
	id: number
	created_at: string
	updated_at: string
	name: string
	type: string
	yield_average: number
	terp_average_total: number
	terp_1: string
	terp_1_value: number
	terp_2: string
	terp_2_value: number
	terp_3: string
	terp_3_value: number
	terp_4: string
	terp_4_value: number
	terp_5: string
	terp_5_value: number
	thc_average: number
	total_cannabinoid_average: number
	light_dep_2022: string
	fall_harvest_2022: string
	quantity_available: number
}

export type Uom = {
	id: number
	created_at: string
	updated_at: string
	name: string
	abbreviation: string
}
