import type { ActivePackageWithLabs } from '~/models/types/custom';
import {
  MagnifyingGlassIcon,
  ArrowDownOnSquareIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Command } from 'cmdk';
import React from 'react';

export default function PackageCMDK({
  packages,
}: {
  packages: ActivePackageWithLabs[];
}): JSX.Element {
  const [search, setSearch] = React.useState(packages[0].strain_name);
  const [packageData, setPackageData] = React.useState<ActivePackageWithLabs>(
    packages[0],
  );

  const handleListItemSelect = (tagNumber: string) => {
    const packageData = packages.find(
      (packageData) => packageData.tag_number === tagNumber,
    );
    if (packageData) {
      setPackageData(packageData);
      setSearch(tagNumber);
    } else {
      setPackageData(packages[0]);
      setSearch(packages[0].tag_number);
    }
  };

  return (
    <div>
      <Command
        className={classNames(
          'cmdk-root:border-radius-16 cmdk-root:border-1 p-2 cmdk-root:w-full',
          'cmdk-root:max-w-screen-lg cmdk-root:overflow-hidden cmdk-root:border-gray-600 cmdk-root:bg-gray-100',
          'cmdk-separator:my-2 cmdk-separator:h-px cmdk-separator:w-full cmdk-separator:bg-gray-600',
        )}>
        {/* Header */}
        <div className="border-b-1 mb-3 flex h-12 items-center gap-8 border-b-gray-500 p-8 pb-2">
          <MagnifyingGlassIcon className="max-w-6 max-h-6" />
          <Command.Input
            autoFocus
            placeholder="Find packages"
            value={search}
            onValueChange={(value: string) => {
              setSearch(value);
            }}
            className={classNames(
              'cmdk-input:w-full cmdk-input:border-none cmdk-input:text-base',
              'cmdk-input:text-gray-900 cmdk-input:outline-none',
            )}
          />
        </div>
        <Command.List className="cmdk-list:overflow-auto">
          <div className="min-h-24 flex max-h-64">
            {/* Left Section */}
            <div className="w-2/5 overflow-y-scroll">
              <Command.Group
                heading="Packages"
                className="mb-2 flex select-none items-center p-4 text-xs text-gray-700">
                {packages.map((pkg: ActivePackageWithLabs) => (
                  <Item
                    key={pkg.id}
                    value={pkg.strain_name}
                    onSelect={() => {
                      handleListItemSelect(pkg.tag_number);
                    }}
                  />
                ))}
              </Command.Group>
            </div>
            <hr className="mr-2 w-px bg-gray-600" />
            {/* Right Section */}
            <div className={classNames('ml-2 flex w-3/5 rounded-lg')}>
              <ul>
                <li>{packageData.tag_number}</li>
                <li>{packageData.strain_name}</li>
                <li>{packageData.batch_code}</li>
                <li>{packageData.thc_total_percent}</li>
                <li>
                  {packageData.quantity} {packageData.uom_abbreviation}
                </li>
              </ul>
            </div>
          </div>
        </Command.List>
      </Command>
    </div>
  );
}

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

function Button(): JSX.Element {
  return (
    <div className="flex items-center justify-center rounded-lg">
      <ArrowDownOnSquareIcon className="h-8 w-8 text-gray-900" />
    </div>
  );
}

function Input(): JSX.Element {
  return (
    <div className="flex items-center justify-center rounded-lg">
      <DocumentTextIcon className="h-8 w-8 text-gray-900" />
    </div>
  );
}

function Item({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (value: string) => void;
}): JSX.Element {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className={classNames(
        'cmdk-item:mr-2 cmdk-item:flex cmdk-item:cursor-pointer cmdk-item:items-center',
        'cmdk-item:mt-2 cmdk-item:text-sm cmdk-item:font-medium cmdk-item:transition-none',
        'cmdk-item:gap-4 cmdk-item:border-0 cmdk-item:p-4 cmdk-item:text-gray-900',
        'cmdk-item:hover:bg-gray-300 cmdk-item:focus:bg-gray-200',
        'cmdk-item-aria-disabled:cursor-not-allowed cmdk-item-aria-disabled:opacity-50 cmdk-item-aria-disabled:hover:bg-transparent',
        'cmdk-item-aria-selected:bg-blue-400 cmdk-item-aria-selected:hover:bg-blue-300',
      )}>
      <div className="flex flex-col gap-4">{value}</div>
    </Command.Item>
  );
}
