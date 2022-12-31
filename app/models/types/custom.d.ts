import type {
	Package,
	LabTestsOnPackages,
	Item,
	ItemType,
	PackageTag,
	Strain,
	Uom,
} from './prisma-model-types';

export type PackageWithNestedData = Package & {
	tag: PackageTag;
	item: ItemWithNesting;
	labTests: LabTestsOnPackages[];
	uom: Uom;
	sourcePackages: PackageWithNestedData[];
};

export type ItemWithNesting = Item & {
	itemType: ItemType;
	strain: Strain;
};

export enum Role {
	'admin' = 'ADMIN',
	'customer' = 'CUSTOMER',
	'guest' = 'GUEST',
	'standard' = 'STANDARD',
	'superadmin' = 'SUPERADMIN',
	'manager' = 'MANAGER',
}

export type ActivePackageWithLabs = {
	id: number;
	created_at: string;
	updated_at: string;
	tag_id: number;
	package_type: string;
	uom_name: string;
	uom_abbreviation: string;
	is_active: boolean;
	quantity: number;
	notes: string;
	packaged_date_time: string;
	harvest_date_time: string;
	lab_testing_state: string;
	lab_testing_state_date_time: string;
	is_trade_sample: boolean;
	is_testing_sample: boolean;
	product_requires_remediation: boolean;
	contains_remediated_product: boolean;
	remediation_date_time: string;
	received_date_time: string;
	received_from_manifest_number: string;
	received_from_facility_license_number: string;
	received_from_facility_name: string;
	is_on_hold: boolean;
	archived_date: string;
	finished_date: string;
	item_id: number;
	provisional_label: string;
	is_provisional: boolean;
	is_sold: boolean;
	ppu_default: number;
	ppu_on_order: number;
	total_package_price_on_order: number;
	ppu_sold_price: number;
	total_sold_price: number;
	packaging_supplies_consumed: boolean;
	is_line_item: boolean;
	order_id: number;
	uom_id: number;
	tag_number: string;
	id_2: number;
	created_at_2: string;
	updated_at_2: string;
	name: string;
	abbreviation: string;
	description: string;
	product_form: string;
	product_modifier: string;
	strain_name: string;
	strain_type: string;
	lab_test_id: number;
	created_at_3: string;
	updated_at_3: string;
	test_name: string;
	batch_code: string;
	test_id_code: string;
	lab_facility_name: string;
	test_performed_date_time: string;
	test_completed: boolean;
	overall_passed: boolean;
	test_type_name: string;
	test_passed: boolean;
	test_comment: string;
	thc_total_percent: number;
	thc_total_value: number;
	cbd_percent: number;
	cbd_value: number;
	terpene_total_percent: number;
	terpene_total_value: number;
	thc_a_percent: number;
	thc_a_value: number;
	delta9_thc_percent: number;
	delta9_thc_value: number;
	delta8_thc_percent: number;
	delta8_thc_value: number;
	thc_v_percent: number;
	thc_v_value: number;
	cbd_a_percent: number;
	cbd_a_value: number;
	cbn_percent: number;
	cbn_value: number;
	cbg_a_percent: number;
	cbg_a_value: number;
	cbg_percent: number;
	cbg_value: number;
	cbc_percent: number;
	cbc_value: number;
	total_cannabinoid_percent: number;
	total_cannabinoid_value: number;
	location_id: number;
	location_name: string;
};
