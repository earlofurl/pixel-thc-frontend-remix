import { Combobox, Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import React, { Fragment, useState } from 'react';
import { authenticator } from '~/auth.server';
import type { ActivePackageWithLabs } from '~/models/types/custom';
import type {
	FacilityLocation,
	Item,
	Order,
	PackageTag,
	Uom,
} from '~/models/types/standard';
import { sessionStorage } from '~/services/session.server';
import { packageUnitConverter } from '~/utils/conversions';

type LoaderData = {
	error: { message: string } | null;
	packages: ActivePackageWithLabs[];
	items: Item[];
	uoms: Uom[];
	packageTags: PackageTag[];
	orders: Order[];
	facilityLocations: FacilityLocation[];
};

type ActionData = {
	errors?: {
		quantity?: string;
		newParentQuantity?: string;
		orderId?: string;
	};
};

function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ');
}

export const loader = async ({ request }: LoaderArgs) => {
	const authResponse = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	});

	const session = await sessionStorage.getSession(
		request.headers.get('Cookie'),
	);
	const error = session.get(authenticator.sessionErrorKey);
	session.set(authenticator.sessionKey, authResponse);

	// TODO: Refactor this to reduce repetition
	const packagesResponse = await fetch(
		`${process.env.API_BASE_URL}/packages/active/all`,
		{
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
			referrerPolicy: 'strict-origin-when-cross-origin',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authResponse.access_token}`,
			},
		},
	);

	const packageTagsResponse = await fetch(
		`${process.env.API_BASE_URL}/package-tags?is_assigned=false&limit=20&offset=0`,
		{
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
			referrerPolicy: 'strict-origin-when-cross-origin',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authResponse.access_token}`,
			},
		},
	);

	const itemsResponse = await fetch(`${process.env.API_BASE_URL}/items`, {
		method: 'GET',
		mode: 'cors',
		credentials: 'include',
		referrerPolicy: 'strict-origin-when-cross-origin',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authResponse.access_token}`,
		},
	});

	const uomsResponse = await fetch(`${process.env.API_BASE_URL}/uoms`, {
		method: 'GET',
		mode: 'cors',
		credentials: 'include',
		referrerPolicy: 'strict-origin-when-cross-origin',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authResponse.access_token}`,
		},
	});

	const ordersResponse = await fetch(`${process.env.API_BASE_URL}/orders`, {
		method: 'GET',
		mode: 'cors',
		credentials: 'include',
		referrerPolicy: 'strict-origin-when-cross-origin',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authResponse.access_token}`,
		},
	});

	const facilityLocationsResponse = await fetch(
		`${process.env.API_BASE_URL}/facility-locations`,
		{
			method: 'GET',
			mode: 'cors',
			credentials: 'include',
			referrerPolicy: 'strict-origin-when-cross-origin',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authResponse.access_token}`,
			},
		},
	);

	const { packages, packageTags, items, uoms, orders, facilityLocations } =
		await Promise.all([
			packagesResponse,
			packageTagsResponse,
			itemsResponse,
			uomsResponse,
			ordersResponse,
			facilityLocationsResponse,
		]).then(
			async ([
				packagesResponse,
				packageTagsResponse,
				itemsResponse,
				uomsResponse,
				ordersResponse,
				facilityLocationsResponse,
			]) => {
				const packages = await packagesResponse.json();
				const packageTags = await packageTagsResponse.json();
				const items = await itemsResponse.json();
				const uoms = await uomsResponse.json();
				const orders = await ordersResponse.json();
				const facilityLocations = await facilityLocationsResponse.json();

				return {
					packages,
					packageTags,
					items,
					uoms,
					orders,
					facilityLocations,
				};
			},
		);

	return json<LoaderData>({
		packages,
		packageTags,
		items,
		uoms,
		orders,
		facilityLocations,
		error,
	});
};

export const action = async ({ request }: ActionArgs) => {
	const authResponse = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	});

	const session = await sessionStorage.getSession(
		request.headers.get('Cookie'),
	);
	const error = session.get(authenticator.sessionErrorKey);
	session.set(authenticator.sessionKey, authResponse);

	const body = await request.formData();

	const sourcePackageId = JSON.parse(
		body.get('parent-package-object') as string,
	).id;

	const packageType = JSON.parse(
		body.get('parent-package-object') as string,
	).package_type;

	const harvestDate = JSON.parse(
		body.get('parent-package-object') as string,
	).harvest_date_time;

	// const inheritedLabTestIds = JSON.parse(
	// 	body.get('parent-package-object') as string,
	// ).labTestIds

	const tagId = JSON.parse(body.get('tag-object') as string).id;

	const itemId = JSON.parse(body.get('item-object') as string).id;

	const quantity = body.get('quantity') as string;

	const uomId = JSON.parse(body.get('uom-object') as string).id;

	// let orderId = null
	// if (JSON.parse(body.get('order-object') as string).id) {
	// 	orderId = JSON.parse(body.get('order-object') as string).id
	// }

	const orderId = JSON.parse(body.get('order-object') as string)?.id ?? null;

	const pricePerUnit = body.get('price-per-unit') as string;

	const labTestId = JSON.parse(
		body.get('parent-package-object') as string,
	).lab_test_id;

	const facilityLocationId = JSON.parse(
		body.get('facility-location-object') as string,
	).id;

	// const newParentQuantity = body.get('new-parent-quantity') as string

	// const cookieHeader = request.headers.get('Cookie')
	// const session = await sessionStorage.getSession(cookieHeader)

	// TODO: I think I should remove most of the testing info from the package model.
	const bodyObject = JSON.stringify({
		source_package_id: sourcePackageId,
		tag_id: tagId,
		package_type: packageType,
		is_active: true,
		quantity: quantity,
		notes: '',
		// packaged_date_time: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]Z'),
		packaged_date_time: '2022-12-18T03:51:39.178012Z',
		harvest_date_time: harvestDate,
		lab_testing_state: '',
		lab_testing_state_date_time: '2001-12-16T20:55:39.178012Z',
		is_trade_sample: false,
		is_testing_sample: false,
		product_requires_remediation: false,
		contains_remediated_product: false,
		remediation_date_time: '2001-12-16T20:55:39.178012Z',
		received_date_time: '2001-12-16T20:55:39.178012Z',
		received_from_manifest_number: 'TestManifestNumber',
		received_from_facility_license_number: 'TestFacilityLicenseNumber',
		received_from_facility_name: 'TestFacilityName',
		is_on_hold: false,
		archived_date: '2001-12-16T20:55:39.178013Z',
		finished_date: '2001-12-16T20:55:39.178013Z',
		item_id: itemId,
		provisional_label: 'TestProvisionalLabel',
		is_provisional: false,
		is_sold: false,
		ppu_default: pricePerUnit,
		ppu_on_order: pricePerUnit,
		total_package_price_on_order: '0.00',
		ppu_sold_price: '0.00',
		total_sold_price: '0.00',
		packaging_supplies_consumed: false,
		is_line_item: false,
		// order_id: orderId,
		uom_id: uomId,
		facility_location_id: facilityLocationId,
		lab_test_id: labTestId,
	});

	// console.log(bodyObject);

	const response = await fetch(`${process.env.API_BASE_URL}/packages`, {
		method: 'POST',
		mode: 'cors',
		credentials: 'include',
		referrerPolicy: 'strict-origin-when-cross-origin',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authResponse.access_token}`,
		},
		body: bodyObject,
	});

	console.log(await response.json());

	const successCreatedResponseCode = 201;
	if (response.status === successCreatedResponseCode) {
		return redirect('/org/inventory');
	}

	const errors = await response.json();
	return json<ActionData>({ errors }, { status: 400 });
};

export default function CreatePackageForm(): JSX.Element {
	const {
		packages,
		packageTags,
		items,
		uoms,
		orders,
		facilityLocations,
		error,
	} = useLoaderData<LoaderData>();
	const formRef = React.useRef<HTMLFormElement>(null);
	const quantityRef = React.useRef<HTMLInputElement>(null);
	const priceRef = React.useRef<HTMLInputElement>(null);
	// selected parent package state
	const [selectedParentPackage, setSelectedParentPackage] =
		useState<ActivePackageWithLabs | null>(null);
	// combobox search query state
	const [parentQuery, setParentQuery] = useState<string>('');

	const [selectedItem, setSelectedItem] = useState<Item | null>(null);
	const [itemQuery, setItemQuery] = useState<string>('');

	const [selectedPackageTag, setSelectedPackageTag] =
		useState<PackageTag | null>(null);
	const [packageTagQuery, setPackageTagQuery] = useState<string>('');

	const [quantity, setQuantity] = useState<number>(0);
	const [uomQuery, setUomQuery] = useState<string>('');
	const [selectedUom, setSelectedUom] = useState<Uom>(uoms[0]);
	const [newParentQuantity, setNewParentQuantity] = useState<number>(0);

	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [pricePerUnit, setPricePerUnit] = useState<number>(0);

	const [selectedFacilityLocation, setSelectedFacilityLocation] =
		useState<FacilityLocation | null>(null);
	const [facilityLocationQuery, setFacilityLocationQuery] =
		useState<string>('');

	// $: if ($selectedParentPackage && $selectedUom.name) {
	// 	parentNewQuantity =
	// 		$selectedParentPackage.quantity -
	// 		packageUnitConverter($selectedParentPackage, $selectedItem, $selectedUom, childQuantity);
	// }

	const calculateNewParentQuantity = (inputQuantity) => {
		setNewParentQuantity(
			selectedParentPackage?.quantity -
				packageUnitConverter({
					parentPackage: selectedParentPackage,
					selectedItem,
					selectedUom,
					childQuantity: Number.parseFloat(inputQuantity),
				}),
		);
	};

	// function calculateNewParentQuantity() {
	// 	setNewParentQuantity(selectedParentPackage?.quantity - quantity)
	// }

	const stats = [
		{
			name: 'Total Subscribers',
			stat: '71,897',
			previousStat: '70,946',
			change: '12%',
			changeType: 'increase',
		},
		{
			name: 'Avg. Open Rate',
			stat: '58.16%',
			previousStat: '56.14%',
			change: '2.02%',
			changeType: 'increase',
		},
		{
			name: 'Avg. Click Rate',
			stat: '24.57%',
			previousStat: '28.62%',
			change: '4.05%',
			changeType: 'decrease',
		},
	];

	// combobox filter for tag number to assign new package
	let filteredTags: PackageTag[];
	if (packageTagQuery === '') {
		filteredTags = packageTags;
	} else {
		filteredTags = packageTags.filter((packageTag: PackageTag) => {
			return packageTag.tag_number
				.toLowerCase()
				.includes(packageTagQuery.toLowerCase());
		});
	}

	// combobox filter for parent package to create new package from
	let filteredPackages: ActivePackageWithLabs[];
	if (parentQuery === '') {
		filteredPackages = packages;
	} else {
		filteredPackages = packages.filter(
			(parentPackage: ActivePackageWithLabs) => {
				return parentPackage?.strain_name
					?.toLowerCase()
					.includes(parentQuery.toLowerCase());
			},
		);
	}

	// combobox filter for item type of new package
	let filteredItems: Item[];
	if (selectedParentPackage) {
		filteredItems = items.filter((item: Item) => {
			return item?.strain_name
				.toLowerCase()
				.includes(selectedParentPackage.strain_name.toLowerCase());
		});
	} else {
		filteredItems = items;
	}

	// combobox filter for UoM to assign new package
	let filteredUoms: Uom[];
	if (uomQuery === '') {
		filteredUoms = uoms;
	} else {
		filteredUoms = uoms.filter((uom: Uom) =>
			uom?.name.toLowerCase().includes(uomQuery.toLowerCase()),
		);
	}

	// combobox filter for facility location to assign new package
	let filteredFacilityLocations: FacilityLocation[];
	if (facilityLocationQuery === '') {
		filteredFacilityLocations = facilityLocations;
	} else {
		filteredFacilityLocations = facilityLocations.filter(
			(facilityLocation: FacilityLocation) => {
				return facilityLocation?.name
					.toLowerCase()
					.includes(facilityLocationQuery.toLowerCase());
			},
		);
	}

	return (
		<div className="mx-auto flex px-4 py-4">
			<form
				ref={formRef}
				method="post"
				className="space-y-8 divide-y divide-gray-200">
				<div className="space-y-8 divide-y divide-gray-200">
					<div>
						<div>
							<h3 className="text-lg font-medium leading-6 text-gray-900">
								Source Package
							</h3>
							{/* <p className="mt-1 text-sm text-gray-500">*/}
							{/*	Start by selecting the existing package the new package*/}
							{/*	originates from.*/}
							{/* </p>*/}
						</div>

						{/* Source Package Select */}
						<Combobox
							as="div"
							value={selectedParentPackage}
							onChange={setSelectedParentPackage}>
							<Combobox.Label className="block text-sm font-medium text-gray-700">
								Select Parent Package
							</Combobox.Label>
							<div className="relative mt-1">
								<Combobox.Input
									className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
									onChange={(event) => {
										setParentQuery(event.target.value);
									}}
									displayValue={(
										selectedParentPackage: ActivePackageWithLabs,
									) =>
										selectedParentPackage?.tag_number
											? selectedParentPackage?.tag_number
											: selectedParentPackage?.tag_number === null
											? 'Selected Pckg Has No Tag'
											: ''
									}
								/>
								{/* Actual input for ComboBox to avoid having to render selection as ID */}
								<input
									type="hidden"
									name="parent-package-object"
									value={JSON.stringify(selectedParentPackage)}
								/>
								{/*  */}
								<Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
									<ChevronUpDownIcon
										className="h-5 w-5 text-gray-400"
										aria-hidden="true"
									/>
								</Combobox.Button>

								{filteredPackages.length > 0 && (
									<Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{filteredPackages.map(
											(
												parentPackage: ActivePackageWithLabs,
												parentPackageIdx: number,
											) => (
												<Combobox.Option
													key={parentPackageIdx}
													value={parentPackage}
													className={({ active }) =>
														classNames(
															'relative cursor-default select-none py-2 pl-3 pr-9',
															active
																? 'bg-indigo-600 text-white'
																: 'text-gray-900',
														)
													}>
													{({ active, selected }) => (
														<>
															<div className="flex">
																<span
																	className={classNames(
																		'block truncate',
																		selected && 'font-semibold',
																	)}>
																	{parentPackage?.strain_name}
																</span>
																<span
																	className={classNames(
																		'ml-2 truncate text-gray-500',
																		active
																			? 'text-indigo-200'
																			: 'text-gray-500',
																	)}>
																	{`${parentPackage?.product_form} ${parentPackage?.product_modifier}`}
																</span>
																<span
																	className={classNames(
																		'ml-2 truncate text-gray-500',
																		active
																			? 'text-indigo-200'
																			: 'text-gray-500',
																	)}>
																	{parentPackage?.batch_code}
																</span>
															</div>
															<div className="mt-1 flex">
																<span
																	className={classNames(
																		'ml-2 truncate text-gray-500',
																		active
																			? 'text-indigo-200'
																			: 'text-gray-500',
																	)}>
																	{parentPackage?.tag_number}
																</span>
																<span
																	className={classNames(
																		'ml-2 truncate text-gray-500',
																		active
																			? 'text-indigo-200'
																			: 'text-gray-500',
																	)}>
																	{`${parentPackage?.thc_total_percent}%`}
																</span>
															</div>
															<div className="mt-1 flex">
																<span
																	className={classNames(
																		'ml-2 truncate text-gray-500',
																		active
																			? 'text-indigo-200'
																			: 'text-gray-500',
																	)}>
																	{parentPackage?.quantity}
																</span>
																<span
																	className={classNames(
																		'ml-2 truncate text-gray-500',
																		active
																			? 'text-indigo-200'
																			: 'text-gray-500',
																	)}>
																	{`${parentPackage?.uom_abbreviation}`}
																</span>
															</div>

															{selected && (
																<span
																	className={classNames(
																		'absolute inset-y-0 right-0 flex items-center pr-4',
																		active ? 'text-white' : 'text-indigo-600',
																	)}>
																	<CheckIcon
																		className="h-5 w-5"
																		aria-hidden="true"
																	/>
																</span>
															)}
														</>
													)}
												</Combobox.Option>
											),
										)}
									</Combobox.Options>
								)}
							</div>
						</Combobox>
						{/* End Source Package Select*/}

						{/*	Source Package Info*/}
						<div>
							<h3 className="text-lg font-medium leading-6 text-gray-900">
								{selectedParentPackage?.strain_name}
								{' - '}
								{selectedParentPackage?.product_form}
								{' - '}
								{selectedParentPackage?.product_modifier}{' '}
								{selectedParentPackage?.batch_code}{' '}
								{selectedParentPackage?.thc_total_percent}
								{'% '}
							</h3>
							<dl className="mt-5 grid max-w-lg grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-3 md:divide-y-0 md:divide-x">
								<div className="px-4 py-5 sm:p-6">
									<dt className="text-base font-normal text-gray-900">
										Source Package
									</dt>
									<dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
										<div className="flex items-baseline text-2xl font-semibold text-indigo-600">
											{newParentQuantity ?? 0}
											<span className="ml-2 text-sm font-medium text-gray-500">
												{selectedParentPackage?.uom_name}
											</span>
										</div>

										{/* <div*/}
										{/*	className={classNames(*/}
										{/*		item.changeType === 'increase'*/}
										{/*			? 'bg-green-100 text-green-800'*/}
										{/*			: 'bg-red-100 text-red-800',*/}
										{/*		'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0',*/}
										{/*	)}>*/}
										{/*	{item.changeType === 'increase' ? (*/}
										{/*		<ArrowUpIcon*/}
										{/*			className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"*/}
										{/*			aria-hidden="true"*/}
										{/*		/>*/}
										{/*	) : (*/}
										{/*		<ArrowDownIcon*/}
										{/*			className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"*/}
										{/*			aria-hidden="true"*/}
										{/*		/>*/}
										{/*	)}*/}

										{/*	<span className="sr-only">*/}
										{/*		{' '}*/}
										{/*		{item.changeType === 'increase'*/}
										{/*			? 'Increased'*/}
										{/*			: 'Decreased'}{' '}*/}
										{/*		by{' '}*/}
										{/*	</span>*/}
										{/*	{item.change}*/}
										{/* </div>*/}
									</dd>
								</div>
							</dl>
						</div>
						{/* End Source Package Info*/}
					</div>
				</div>

				<div className="pt-8">
					<div>
						<h3 className="text-lg font-medium leading-6 text-gray-900">
							New Package
						</h3>
						{/* <p className="mt-1 text-sm text-gray-500">*/}
						{/*	Enter the information for the package you are creating.*/}
						{/* </p>*/}
					</div>
					<div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
						<div className="sm:col-span-4">
							{/* Item Type Select Combobox */}
							<Combobox
								as="div"
								value={selectedItem}
								onChange={setSelectedItem}>
								<Combobox.Label className="block text-sm font-medium text-gray-700">
									Select Item to Create
								</Combobox.Label>
								<div className="relative mt-1">
									<Combobox.Input
										className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
										onChange={(event) => {
											setItemQuery(event.target.value);
										}}
										displayValue={(item: Item) =>
											item?.strain_name
												? `${item?.product_form} - ${item?.product_modifier} - ${item?.strain_name}`
												: ''
										}
									/>
									{/* Actual input for ComboBox to avoid having to render selection as ID */}
									<input
										type="hidden"
										name="item-object"
										value={JSON.stringify(selectedItem)}
									/>
									{/*  */}
									<Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
										<ChevronUpDownIcon
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</Combobox.Button>

									{filteredItems.length > 0 && (
										<Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
											{filteredItems.map((item: Item, itemIdx: number) => (
												<Combobox.Option
													key={itemIdx}
													value={item}
													className={({ active }) =>
														classNames(
															'relative cursor-default select-none py-2 pl-3 pr-9',
															active
																? 'bg-indigo-600 text-white'
																: 'text-gray-900',
														)
													}>
													{({ active, selected }) => (
														<>
															<div className="flex">
																<span
																	className={classNames(
																		'block truncate',
																		selected && 'font-semibold',
																	)}>
																	{item?.product_form}
																	{' - '}
																	{item?.product_modifier}
																	{' - '}
																	{item?.strain_name}
																</span>
															</div>

															{selected && (
																<span
																	className={classNames(
																		'absolute inset-y-0 right-0 flex items-center pr-4',
																		active ? 'text-white' : 'text-indigo-600',
																	)}>
																	<CheckIcon
																		className="h-5 w-5"
																		aria-hidden="true"
																	/>
																</span>
															)}
														</>
													)}
												</Combobox.Option>
											))}
										</Combobox.Options>
									)}
								</div>
							</Combobox>
						</div>
					</div>
					{/* Combined Unit of Measure Select*/}
					<div>
						{/* Select UoM Listbox */}
						<Listbox value={selectedUom} onChange={setSelectedUom}>
							{({ open }) => (
								<>
									<Listbox.Label className="block text-sm font-medium text-gray-700">
										UoM
									</Listbox.Label>
									<div className="relative mt-1">
										<Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
											<span className="block truncate">{selectedUom.name}</span>
											<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
												<ChevronUpDownIcon
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</span>
										</Listbox.Button>

										<Transition
											show={open}
											as={Fragment}
											leave="transition ease-in duration-100"
											leaveFrom="opacity-100"
											leaveTo="opacity-0">
											<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
												{uoms.map((uom) => (
													<Listbox.Option
														key={uom.id}
														className={({ active }) =>
															classNames(
																active
																	? 'bg-indigo-600 text-white'
																	: 'text-gray-900',
																'relative cursor-default select-none py-2 pl-3 pr-9',
															)
														}
														value={uom}>
														{({ selected, active }) => (
															<>
																<span
																	className={classNames(
																		selected ? 'font-semibold' : 'font-normal',
																		'block truncate',
																	)}>
																	{uom.name}
																</span>

																{selected ? (
																	<span
																		className={classNames(
																			active ? 'text-white' : 'text-indigo-600',
																			'absolute inset-y-0 right-0 flex items-center pr-4',
																		)}>
																		<CheckIcon
																			className="h-5 w-5"
																			aria-hidden="true"
																		/>
																	</span>
																) : null}
															</>
														)}
													</Listbox.Option>
												))}
											</Listbox.Options>
										</Transition>
									</div>
								</>
							)}
						</Listbox>
						<input
							type="hidden"
							name="uom-object"
							value={JSON.stringify(selectedUom)}
						/>
						{/* End Select UoM Listbox */}
						{/* Quantity input*/}
						<label
							htmlFor="quantity"
							className="block text-sm font-medium text-gray-700">
							Quantity
						</label>
						<div className="max-w-60 relative mt-1 rounded-md shadow-sm">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								{/* <span className="text-gray-500 sm:text-sm">$</span>*/}
							</div>
							<input
								type="number"
								ref={quantityRef}
								step={0.0001}
								name="quantity"
								id="quantity"
								onChange={(event) => {
									setQuantity(Number.parseFloat(event.target.value));
									calculateNewParentQuantity(event.target.value);
								}}
								className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								placeholder="0.0000"
							/>
						</div>
						{/* End Quantity Input*/}

						{/* <div className="flex items-center">*/}
						{/*	<label htmlFor="quantity" className="sr-only">*/}
						{/*		Quantity*/}
						{/*	</label>*/}
						{/*	<Listbox value={selectedUom} onChange={setSelectedUom}>*/}
						{/*		<Listbox.Button className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">*/}
						{/*			{selectedUom.name ?? ''}*/}
						{/*		</Listbox.Button>*/}
						{/*		<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-24 origin-top-right overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">*/}
						{/*			{uoms.map((uom) => (*/}
						{/*				<Listbox.Option key={uom.id} value={uom}>*/}
						{/*					{uom.name}*/}
						{/*				</Listbox.Option>*/}
						{/*			))}*/}
						{/*		</Listbox.Options>*/}
						{/*	</Listbox>*/}
						{/*	<input*/}
						{/*		type="hidden"*/}
						{/*		name="uom-object"*/}
						{/*		value={JSON.stringify(selectedUom)}*/}
						{/*	/>*/}
						{/* </div>*/}
					</div>
					{/* End Combined Unit of Measure Select*/}
					{/* New Package Tag Select */}
					<Combobox
						as="div"
						value={selectedPackageTag}
						onChange={setSelectedPackageTag}>
						<Combobox.Label className="block text-sm font-medium text-gray-700">
							Select New Package Tag
						</Combobox.Label>
						<div className="relative mt-1">
							<Combobox.Input
								className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
								onChange={(event) => {
									setPackageTagQuery(event.target.value);
								}}
								displayValue={(selectedPackageTag: PackageTag) =>
									selectedPackageTag?.tag_number
										? selectedPackageTag?.tag_number
										: ''
								}
							/>
							{/* Actual input for ComboBox to avoid having to render selection as ID */}
							<input
								type="hidden"
								name="tag-object"
								value={JSON.stringify(selectedPackageTag)}
							/>
							{/*  */}
							<Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
								<ChevronUpDownIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							</Combobox.Button>

							{filteredTags.length > 0 && (
								<Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
									{filteredTags.map((tag: PackageTag, tagIdx: number) => (
										<Combobox.Option
											key={tagIdx}
											value={tag}
											className={({ active }) =>
												classNames(
													'relative cursor-default select-none py-2 pl-3 pr-9',
													active ? 'bg-indigo-600 text-white' : 'text-gray-900',
												)
											}>
											{({ active, selected }) => (
												<>
													<div className="flex">
														<span
															className={classNames(
																'block truncate',
																selected && 'font-semibold',
															)}>
															{tag?.tag_number}
														</span>
													</div>

													{selected && (
														<span
															className={classNames(
																'absolute inset-y-0 right-0 flex items-center pr-4',
																active ? 'text-white' : 'text-indigo-600',
															)}>
															<CheckIcon
																className="h-5 w-5"
																aria-hidden="true"
															/>
														</span>
													)}
												</>
											)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							)}
						</div>
					</Combobox>
					{/* End Package Tag Select*/}
					{/* New Parent Package Quantity Hidden Input*/}
					<input
						type="hidden"
						name="new-parent-quantity"
						value={newParentQuantity}
					/>
				</div>

				{/* Select Location to Assign Combobox */}
				<Combobox
					as="div"
					value={selectedFacilityLocation}
					onChange={setSelectedFacilityLocation}>
					<Combobox.Label className="block text-sm font-medium text-gray-700">
						Select New Location
					</Combobox.Label>
					<div className="relative mt-1">
						<Combobox.Input
							className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
							onChange={(event) => {
								setFacilityLocationQuery(event.target.value);
							}}
							displayValue={(selectedFacilityLocation: FacilityLocation) =>
								selectedFacilityLocation?.name
									? selectedFacilityLocation?.name
									: ''
							}
						/>
						{/* Actual input for ComboBox to avoid having to render selection as ID */}
						<input
							type="hidden"
							name="tag-object"
							value={JSON.stringify(selectedFacilityLocation)}
						/>
						{/*  */}
						<Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
							<ChevronUpDownIcon
								className="h-5 w-5 text-gray-400"
								aria-hidden="true"
							/>
						</Combobox.Button>

						{filteredFacilityLocations.length > 0 && (
							<Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								{filteredFacilityLocations.map(
									(location: FacilityLocation, locationIdx: number) => (
										<Combobox.Option
											key={locationIdx}
											value={location}
											className={({ active }) =>
												classNames(
													'relative cursor-default select-none py-2 pl-3 pr-9',
													active ? 'bg-indigo-600 text-white' : 'text-gray-900',
												)
											}>
											{({ active, selected }) => (
												<>
													<div className="flex">
														<span
															className={classNames(
																'block truncate',
																selected && 'font-semibold',
															)}>
															{location?.name}
														</span>
													</div>

													{selected && (
														<span
															className={classNames(
																'absolute inset-y-0 right-0 flex items-center pr-4',
																active ? 'text-white' : 'text-indigo-600',
															)}>
															<CheckIcon
																className="h-5 w-5"
																aria-hidden="true"
															/>
														</span>
													)}
												</>
											)}
										</Combobox.Option>
									),
								)}
							</Combobox.Options>
						)}
					</div>
				</Combobox>
				{/* End Select Location to Assign Combobox */}
				{/* Location Hidden Input*/}
				<input
					type="hidden"
					name="facility-location-object"
					value={JSON.stringify(selectedFacilityLocation)}
				/>

				{/* Select Order to Add Listbox */}
				<Listbox value={selectedOrder} onChange={setSelectedOrder}>
					{({ open }) => (
						<>
							<Listbox.Label className="block text-sm font-medium text-gray-700">
								Add to Order (Optional)
							</Listbox.Label>
							<div className="relative mt-1">
								<Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
									<span className="block truncate">
										{selectedOrder?.customer_name ?? 'Select an Order'}
									</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
										<ChevronUpDownIcon
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</span>
								</Listbox.Button>

								<Transition
									show={open}
									as={Fragment}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0">
									<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{orders.map((order) => (
											<Listbox.Option
												key={order.id}
												className={({ active }) =>
													classNames(
														active
															? 'bg-indigo-600 text-white'
															: 'text-gray-900',
														'relative cursor-default select-none py-2 pl-3 pr-9',
													)
												}
												value={order}>
												{({ selected, active }) => (
													<>
														<span
															className={classNames(
																selected ? 'font-semibold' : 'font-normal',
																'block truncate',
															)}>
															{order.customer_name}
														</span>

														{selected ? (
															<span
																className={classNames(
																	active ? 'text-white' : 'text-indigo-600',
																	'absolute inset-y-0 right-0 flex items-center pr-4',
																)}>
																<CheckIcon
																	className="h-5 w-5"
																	aria-hidden="true"
																/>
															</span>
														) : null}
													</>
												)}
											</Listbox.Option>
										))}
									</Listbox.Options>
								</Transition>
							</div>
						</>
					)}
				</Listbox>
				<input
					type="hidden"
					name="order-object"
					value={JSON.stringify(selectedOrder)}
				/>
				{/* End Select Order to Add Listbox */}

				{/* Price per Unit input*/}
				<label
					htmlFor="price"
					className="block text-sm font-medium text-gray-700">
					Price per Unit
				</label>
				<div className="max-w-60 relative mt-1 rounded-md shadow-sm">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						{/* <span className="text-gray-500 sm:text-sm">$</span>*/}
					</div>
					<input
						type="number"
						ref={priceRef}
						step={0.0001}
						name="price"
						id="price"
						onChange={(event) => {
							setPricePerUnit(Number.parseFloat(event.target.value));
						}}
						className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						placeholder="0.0000"
					/>
				</div>
				<input type="hidden" name="price-per-unit" value={pricePerUnit} />
				{/* End Price per Unit Input*/}

				<div className="pt-5">
					<div className="flex justify-end">
						<button
							type="button"
							className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
							{' '}
							Cancel
						</button>
						<button
							type="submit"
							className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
							Save
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

// Error handling below
export function ErrorBoundary({ error }: { error: Error }): JSX.Element {
	console.error(error);

	return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
	const caught = useCatch();

	if (caught.status === 404) {
		return <div>Not found</div>;
	}

	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
