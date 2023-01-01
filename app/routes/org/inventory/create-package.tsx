import { Combobox, Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import type { ActionArgs, LoaderArgs, LoaderFunction } from '@remix-run/node';
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
	error?: { message: string } | null;
	quantity?: string;
	newParentQuantity?: string;
	orderId?: string;
};

function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ');
}

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
	const authResponse = await authenticator.isAuthenticated(request, {
		failureRedirect: '/login',
	});

	const session = await sessionStorage.getSession(
		request.headers.get('Cookie'),
	);
	const error = session.get(authenticator.sessionErrorKey);
	session.set(authenticator.sessionKey, authResponse);

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
	let error = session.get(authenticator.sessionErrorKey);
	session.set(authenticator.sessionKey, authResponse);

	// check for auth error
	if (error) {
		return json<ActionData>({ error: { message: error } }, { status: 401 });
	}

	const body = await request.formData();

	const parsedParentPackageObject = JSON.parse(
		body.get('parent-package-object') as string,
	);
	const parsedTagObject = JSON.parse(body.get('tag-object') as string);
	const parsedItemObject = JSON.parse(body.get('item-object') as string);
	const quantity = body.get('quantity') as string;
	const parsedUomObject = JSON.parse(body.get('uom-object') as string);
	const orderId = JSON.parse(body.get('order-object') as string)?.id ?? null; // TODO: can switch the order select to only return ID
	const pricePerUnit = body.get('price-per-unit') as string;
	const facilityLocationId = JSON.parse(
		body.get('facility-location-object') as string,
	).id;
	const notes = body.get('notes') as string;
	let isLineItem = false;
	if (orderId !== null) {
		isLineItem = true;
	}

	const bodyObject = JSON.stringify({
		source_package_id: parsedParentPackageObject.id,
		tag_id: parsedTagObject.id,
		package_type: parsedParentPackageObject.package_type,
		is_active: true, // new packages are always active
		quantity,
		notes,
		packaged_date_time: new Date().toISOString(),
		harvest_date_time: parsedParentPackageObject.harvest_date_time,
		lab_testing_state: '', // TODO: pull this from the lab test
		lab_testing_state_date_time:
			parsedParentPackageObject.test_performed_date_time,
		is_trade_sample: false, // TODO: add checkbox to form
		is_testing_sample: false, // TODO: add checkbox to form
		product_requires_remediation:
			parsedParentPackageObject.product_requires_remediation,
		contains_remediated_product:
			parsedParentPackageObject.contains_remediated_product,
		remediation_date_time: parsedParentPackageObject.remediation_date_time,
		received_date_time: null, // newly created package never received
		received_from_manifest_number: null, // newly created package never received
		received_from_facility_license_number: null, // newly created package never received
		received_from_facility_name: null, // newly created package never received
		is_on_hold: false, // newly created package never on hold
		archived_date: null, // newly created package never archived
		finished_date: null, // newly created package never finished
		item_id: parsedItemObject.id,
		provisional_label: parsedTagObject.tag_number,
		is_provisional: false,
		is_sold: false,
		ppu_default: pricePerUnit,
		ppu_on_order: pricePerUnit,
		total_package_price_on_order: '0.00',
		ppu_sold_price: '0.00',
		total_sold_price: '0.00',
		packaging_supplies_consumed: false, // TODO: Not yet implemented
		is_line_item: isLineItem,
		// order_id: orderId, // TODO: Not yet implemented
		uom_id: parsedUomObject.id,
		facility_location_id: facilityLocationId,
		lab_test_id: parsedParentPackageObject.lab_test_id,
	});

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

	const successCreatedResponseCode = 201;
	if (response.status === successCreatedResponseCode) {
		return redirect('/org/inventory');
	}

	error = await response.json();
	return json<ActionData>({ error }, { status: 400 });
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

	// refs
	const formRef = React.useRef<HTMLFormElement>(null);
	const quantityRef = React.useRef<HTMLInputElement>(null);
	const priceRef = React.useRef<HTMLInputElement>(null);
	const notesRef = React.useRef<HTMLInputElement>(null);

	// state
	const [selectedParentPackage, setSelectedParentPackage] =
		useState<ActivePackageWithLabs | null>(null);
	const [parentQuery, setParentQuery] = useState<string>('');

	const [selectedItem, setSelectedItem] = useState<Item | null>(null);
	const [itemQuery, setItemQuery] = useState<string>('');

	const [selectedPackageTag, setSelectedPackageTag] =
		useState<PackageTag | null>(packageTags[0]);
	const [packageTagQuery, setPackageTagQuery] = useState<string>('');

	const [quantity, setQuantity] = useState<number>(0);
	const [newParentQuantity, setNewParentQuantity] = useState<number>(0);

	const [uomQuery, setUomQuery] = useState<string>('');
	const [selectedUom, setSelectedUom] = useState<Uom>(uoms[0]);

	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [pricePerUnit, setPricePerUnit] = useState<number>(0);

	const [selectedFacilityLocation, setSelectedFacilityLocation] =
		useState<FacilityLocation | null>(facilityLocations[0]);
	const [facilityLocationQuery, setFacilityLocationQuery] =
		useState<string>('');

	// TODO: Edit this to handle cases in which selectedParentPackage is undefined and returns NaN
	const calculateNewParentQuantity = (inputQuantity: string) => {
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
			{/* Error Message */}
			{error ? <div>Error: {error.message}</div> : null}
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
										selectedParentPackage?.tag_number ??
										(selectedParentPackage?.tag_number === null
											? 'Selected Pckg Has No Tag'
											: '')
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
											(parentPackage: ActivePackageWithLabs) => (
												<Combobox.Option
													key={parentPackage.id}
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
																	{parentPackage?.quantity}{' '}
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
											{filteredItems.map((item: Item) => (
												<Combobox.Option
													key={item.id}
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
									selectedPackageTag?.tag_number ?? ''
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
									{filteredTags.map((tag: PackageTag) => (
										<Combobox.Option
											key={tag.id}
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
								selectedFacilityLocation?.name ?? ''
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
								{filteredFacilityLocations.map((location: FacilityLocation) => (
									<Combobox.Option
										key={location.id}
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
														<CheckIcon className="h-5 w-5" aria-hidden="true" />
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
						step={0.01}
						name="price"
						id="price"
						onChange={(event) => {
							setPricePerUnit(Number.parseFloat(event.target.value));
						}}
						className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						placeholder="0.00"
					/>
				</div>
				<input type="hidden" name="price-per-unit" value={pricePerUnit} />
				{/* End Price per Unit Input*/}

				{/* Text Input for Notes */}
				<label
					htmlFor="notes"
					className="block text-sm font-medium text-gray-700">
					Notes
				</label>
				<div className="mt-1">
					<input
						type="text"
						name="notes"
						id="notes"
						ref={notesRef}
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					/>
				</div>
				{/* End Text Input for Notes*/}

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
	return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary(): JSX.Element {
	const caught = useCatch();

	if (caught.status === 404) {
		return <div>Not found</div>;
	}

	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
