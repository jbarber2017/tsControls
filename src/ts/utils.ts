export class Utils {

    static exists(value: any): boolean {
        if (value === null || value === undefined || value === '') {
            return false;
        } else {
            return true;
        }
    }

    static missing(value: any): boolean {
        return !this.exists(value);
    }

    static iterateObject(object: any, callback: (key: string, value: any) => void) {
        if (this.missing(object)) {
            return;
        }
        let keys = Object.keys(object);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = object[key];
            callback(key, value);
        }
    }

    static mapObject<TResult>(object: any, callback: (item: any) => TResult) {
        let result: TResult[] = [];
        Utils.iterateObject(object, (key: string, value: any) => {
            result.push(callback(value));
        });
        return result;
    }

    static forEachSnapshotFirst(list: any[], callback: (item: any)=>void ): void {
        if (list) {
            let arrayCopy = list.slice(0);
            arrayCopy.forEach(callback);
        }
    }

    static removeFromArray<T>(array: T[], object: T) {
        if (array.indexOf(object) >= 0) {
            array.splice(array.indexOf(object), 1);
        }
    }

    static passiveEvents:string[] = ['touchstart','touchend','touchmove','touchcancel'];

    static addSafePassiveEventListener (eElement: HTMLElement, event: string, listener: (event?: any)=>void){
        eElement.addEventListener(event, listener, <any>(Utils.passiveEvents.indexOf(event) > -1 ? {passive:true} : null));
    }

    static loadTemplate(template: string): HTMLElement {
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        return <HTMLElement> tempDiv.firstChild;
    }

        //Returns true if it is a DOM node
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    static isNode(o: any) {
        return (
            typeof Node === "function" ? o instanceof Node :
                o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    }

    //Returns true if it is a DOM element
    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    static isElement(o: any) {
        return (
            typeof HTMLElement === "function" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }

    static isNodeOrElement(o: any) {
        return this.isNode(o) || this.isElement(o);
    }

    static ensureElement(item: HTMLElement|string): HTMLElement {
        if (typeof item === 'string') {
            return this.loadTemplate(item);
        } else {
            return <HTMLElement> item;
        }
    }

    static addOrRemoveCssClass(element: HTMLElement, className: string, addOrRemove: boolean) {
        if (addOrRemove) {
            this.addCssClass(element, className);
        } else {
            this.removeCssClass(element, className);
        }
    }

    static removeCssClass(element: HTMLElement, className: string) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            if (element.className && element.className.length > 0) {
                let cssClasses = element.className.split(' ');
                if (cssClasses.indexOf(className) >= 0) {
                    // remove all instances of the item, not just the first, in case it's in more than once
                    while (cssClasses.indexOf(className) >= 0) {
                        cssClasses.splice(cssClasses.indexOf(className), 1);
                    }
                    element.className = cssClasses.join(' ');
                }
            }
        }
    }

    static makeNull(value: any) {
        if (value === null || value === undefined || value === "") {
            return null;
        } else {
            return value;
        }
    }

    static toStrings<T>(array: T[]): string[] {
        return this.map(array, function (item) {
            if (item === undefined || item === null || !item.toString) {
                return null;
            } else {
                return item.toString();
            }
        });
    }

    static map<TItem, TResult>(array: TItem[], callback: (item: TItem) => TResult) {
        let result: TResult[] = [];
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            let mappedItem = callback(item);
            result.push(mappedItem);
        }
        return result;
    }

    static isVisible(element: HTMLElement) {
        return (element.offsetParent !== null);
    }

    static isElementInEventPath(element: HTMLElement, event: Event): boolean {
        if (!event || !element) { return false; }

        let sourceElement = _.getTarget(event);

        while (sourceElement) {
            if (sourceElement===element) {
                return true;
            }
            sourceElement = sourceElement.parentElement;
        }

        return false;
    }

    static createIconNoSpan(iconName: string, gridOptionsWrapper: GridOptionsWrapper): HTMLElement {
        let userProvidedIcon: Function | string;
        // check col for icon first
        // it not in col, try grid options
        if (!userProvidedIcon && gridOptionsWrapper.getIcons()) {
            userProvidedIcon = gridOptionsWrapper.getIcons()[iconName];
        }
        // now if user provided, use it
        if (userProvidedIcon) {
            let rendererResult: any;
            if (typeof userProvidedIcon === 'function') {
                rendererResult = userProvidedIcon();
            } else if (typeof userProvidedIcon === 'string') {
                rendererResult = userProvidedIcon;
            } else {
                throw 'icon from grid options needs to be a string or a function';
            }
            if (typeof rendererResult === 'string') {
                return this.loadTemplate(rendererResult);
            } else if (this.isNodeOrElement(rendererResult)) {
                return rendererResult;
            } else {
                throw 'iconRenderer should return back a string or a dom object';
            }
        } else {
            const span = document.createElement('span');
            const cssClass = this.iconNameClassMap[iconName];
            if (!cssClass) {
                throw new Error(`${iconName} did not find class`)
            }
            span.setAttribute("class", "ag-icon ag-icon-" + cssClass);
            return span;
        }
    }

    static iconNameClassMap: {[key: string]: string } = {
        'columnMovePin': 'pin',
        'columnMoveAdd': 'plus',
        'columnMoveHide': 'eye-slash',
        'columnMoveMove': 'arrows', 
        'columnMoveLeft': 'left',
        'columnMoveRight': 'right',
        'columnMoveGroup': 'group',
        'columnMoveValue': 'aggregation',
        'columnMovePivot': 'pivot',
        'dropNotAllowed': 'not-allowed',
        'groupContracted': 'expanded',
        'groupExpanded': 'contracted',
        'checkboxChecked': 'checkbox-checked',
        'checkboxUnchecked': 'checkbox-unchecked',
        'checkboxIndeterminate': 'checkbox-indeterminate',
        'checkboxCheckedReadOnly': 'checkbox-checked-readonly',
        'checkboxUncheckedReadOnly': 'checkbox-unchecked-readonly',
        'checkboxIndeterminateReadOnly': 'checkbox-indeterminate-readonly',
        'groupLoading': 'loading',
        'menu': 'menu',
        'filter': 'filter',
        'columns': 'columns',
        'menuPin': 'pin',
        'menuValue': 'aggregation',
        'menuAddRowGroup': 'group',
        'menuRemoveRowGroup': 'group',
        'clipboardCopy': 'copy',
        'clipboardCut': 'cut',
        'clipboardPaste': 'paste',
        'pivotPanel': 'pivot',
        'rowGroupPanel': 'group', 
        'valuePanel': 'aggregation', 
        'columnGroupOpened': 'expanded',
        'columnGroupClosed': 'contracted',
        'columnSelectClosed': 'tree-closed', 
        'columnSelectOpen': 'tree-open',
        // from deprecated header, remove at some point
        'sortAscending': 'asc',
        'sortDescending': 'desc',
        'sortUnSort': 'none'
    }

    static addAgGridEventPath(event: Event): void {
        (<any>event).__agGridEventPath = this.getEventPath(event);
    }

    // srcElement is only available in IE. In all other browsers it is target
    // http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
    static getTarget(event: Event): Element {
        let eventNoType = <any> event;
        return eventNoType.target || eventNoType.srcElement;
    }

    static createEventPath(event: Event): EventTarget[] {
        let res: EventTarget[] = [];
        let pointer = _.getTarget(event);
        while (pointer) {
            res.push(pointer);
            pointer = pointer.parentElement;
        }
        return res;
    }

    static getEventPath(event: Event): EventTarget[] {
        // https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
        // https://developer.mozilla.org/en-US/docs/Web/API/Event

        let eventNoType = <any> event;
        if (event.deepPath) {
            // IE supports deep path
            return event.deepPath();
        } else if (eventNoType.path) {
            // Chrome supports path
            return eventNoType.path;
        } else if (eventNoType.composedPath) {
            // Firefox supports composePath
            return eventNoType.composedPath();
        } else if (eventNoType.__agGridEventPath) {
            // Firefox supports composePath
            return eventNoType.__agGridEventPath;
        } else {
            // and finally, if none of the above worked,
            // we create the path ourselves
            return this.createEventPath(event);
        }
    }

   /**
     * https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
     */
    static debounce(func: () => void, wait: number, immediate: boolean = false) {
        // 'private' variable for instance
        // The returned function will be able to reference this due to closure.
        // Each call to the returned function will share this common timer.
        var timeout: any;

        // Calling debounce returns a new anonymous function
        return function () {
            // reference the context and args for the setTimeout function
            var context = this,
                args = arguments;

            // Should the function be called now? If immediate is true
            //   and not already in a timeout then the answer is: Yes
            var callNow = immediate && !timeout;

            // This is the basic debounce behaviour where you can call this
            //   function several times, but it will only execute once
            //   [before or after imposing a delay].
            //   Each time the returned function is called, the timer starts over.
            clearTimeout(timeout);

            // Set the new timeout
            timeout = setTimeout(function () {

                // Inside the timeout function, clear the timeout variable
                // which will let the next execution run when in 'immediate' mode
                timeout = null;

                // Check if the function already ran with the immediate flag
                if (!immediate) {
                    // Call the original function with apply
                    // apply lets you define the 'this' object as well as the arguments
                    //    (both captured before setTimeout)
                    func.apply(context, args);
                }
            }, wait);

            // Immediate mode and no wait timer? Execute the function..
            if (callNow) func.apply(context, args);
        };
    };

    static defaultComparator(valueA: any, valueB: any, accentedCompare: boolean = false): number {
        let valueAMissing = valueA === null || valueA === undefined;
        let valueBMissing = valueB === null || valueB === undefined;

        // this is for aggregations sum and avg, where the result can be a number that is wrapped.
        // if we didn't do this, then the toString() value would be used, which would result in
        // the strings getting used instead of the numbers.
        if (valueA && valueA.toNumber) { valueA = valueA.toNumber(); }
        if (valueB && valueB.toNumber) { valueB = valueB.toNumber(); }

        if (valueAMissing && valueBMissing) {
            return 0;
        }
        if (valueAMissing) {
            return -1;
        }
        if (valueBMissing) {
            return 1;
        }

        if (typeof valueA === "string") {
            if (! accentedCompare) {
                return doQuickCompare(valueA, valueB);
            } else {
                try {
                    // using local compare also allows chinese comparisons
                    return valueA.localeCompare(valueB);
                } catch (e) {
                    // if something wrong with localeCompare, eg not supported
                    // by browser, then just continue with the quick one
                    return doQuickCompare(valueA, valueB);
                }
            }

        }

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }

        function doQuickCompare (a:string, b:string): number{
            return (a > b ? 1 : (a < b ? -1 : 0));
        }
    }


    static addCssClass(element: HTMLElement, className: string) {
        if (!className || className.length === 0) {
            return;
        }
        if (className.indexOf(' ') >= 0) {
            className.split(' ').forEach(value => this.addCssClass(element, value));
            return;
        }
        if (element.classList) {
            element.classList.add(className);
        } else {
            if (element.className && element.className.length > 0) {
                let cssClasses = element.className.split(' ');
                if (cssClasses.indexOf(className) < 0) {
                    cssClasses.push(className);
                    element.className = cssClasses.join(' ');
                }
            } else {
                element.className = className;
            }
        }
    }
}

export class NumberSequence {
    
        private nextValue: number;
        private step: number;
    
        constructor(initValue = 0, step = 1) {
            this.nextValue = initValue;
            this.step = step;
        }
    
        public next(): number {
            let valToReturn = this.nextValue;
            this.nextValue += this.step;
            return valToReturn;
        }
    
        public peek(): number {
            return this.nextValue;
        }
    
        public skip(count: number): void {
            this.nextValue += count;
        }
    }
    
    export let _ = Utils;