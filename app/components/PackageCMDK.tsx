import type { ActivePackageWithLabs } from '~/models/types/custom';
import {
  MagnifyingGlassIcon,
  ArrowDownOnSquareIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Command } from 'cmdk';
import React, { ChangeEvent } from 'react';

export default function PackageCMDK({
  packages,
}: {
  packages: ActivePackageWithLabs[];
}): JSX.Element {
  const [search, setSearch] = React.useState(packages[0].tag_number);
  const [packageData, setPackageData] = React.useState<ActivePackageWithLabs>(
    packages[0],
  );

  // function handlePackageSelect(value: string) {
  //   const selectedPackage = packages.find((pkg) => pkg.tag_number === value);
  //   if (selectedPackage) {
  //     setPackageData(selectedPackage);
  //   }
  // }

  return (
    <div>
      <Command
        className={classNames(
          'cmdk-root:border-radius-16 cmdk-root:border-1 p-2 cmdk-root:w-full',
          'cmdk-root:max-w-screen-sm cmdk-root:overflow-hidden cmdk-root:border-gray-600 cmdk-root:bg-white',
        )}>
        {/* Header */}
        <div className="border-b-1 mb-3 flex h-12 items-center gap-8 border-b-gray-500 p-8 pb-2">
          <MagnifyingGlassIcon className="max-w-6 max-h-6" />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Find packages"
            className={classNames(
              'cmdk-input:w-full cmdk-input:border-none cmdk-input:text-base',
              'cmdk-input:text-gray-900 cmdk-input:outline-none',
            )}
          />
        </div>
        <Command.List>
          <div className="min-h-24 flex max-h-64">
            {/* Left Section */}
            <div className="w-2/5 overflow-scroll">
              <Command.Group heading="Packages">
                {packages.map((pkg: ActivePackageWithLabs) => (
                  <Item
                    key={pkg.id}
                    value={pkg.tag_number}
                    onSelect={() => {
                      setPackageData(pkg);
                    }}
                  />
                ))}
              </Command.Group>
            </div>
            <hr className="mr-2 w-px bg-gray-600" />
            {/* Right Section */}
            <div
              className={classNames(
                'ml-2 flex w-3/5 items-center justify-center rounded-lg',
              )}>
              {JSON.stringify(packageData)}
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
