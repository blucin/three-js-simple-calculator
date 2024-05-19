import { Tabs } from 'flowbite';
import type { TabsOptions, TabsInterface, TabItem } from 'flowbite';
import type { InstanceOptions } from 'flowbite';

const tabsElement: HTMLElement = document.getElementById('tabs') as HTMLElement;

// create an array of objects with the id, trigger element (eg. button), and the content element
const tabElements: TabItem[] = [
    {
        id: 'calculator',
        triggerEl: document.querySelector('#calculator-tab-trigger') as HTMLElement,
        targetEl: document.querySelector('#calculator-tab-content') as HTMLElement,
    },
    {
        id: 'help',
        triggerEl: document.querySelector('#help-tab-trigger') as HTMLElement,
        targetEl: document.querySelector('#help-tab-content') as HTMLElement,
    },
];

// options with default values
const options: TabsOptions = {
    defaultTabId: 'calculator',
    activeClasses:
        'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500',
    inactiveClasses:
        'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
};

// instance options with default values
const instanceOptions: InstanceOptions = {
  id: 'tabs',
  override: true
};

export function initTabs() {
  /*
  * tabsElement: parent element of the tabs component (required)
  * tabElements: array of tab elements (required)
  * options (optional)
  * instanceOptions (optional)
  */
  const tabs: TabsInterface = new Tabs(tabsElement, tabElements, options, instanceOptions);
  tabs.show('calculator');
}