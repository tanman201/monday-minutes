// Version 1.0


class DurationPickerMaker {

    TIME_CHUNK_SELECTION_ATTR_NAME = "time-chunk-selection-mode";

    _SelectTextInTargetElement(event) {
        let selectedTimeChunkName = this._formattedDuration.GetSelectedTimeChunk(event.target.selectionStart);
        let selectionRange = this._formattedDuration.GetIndexRangeForTimeChunk(selectedTimeChunkName);
        event.target.setAttribute(this.TIME_CHUNK_SELECTION_ATTR_NAME, selectedTimeChunkName);
        event.target.setSelectionRange(selectionRange.startIndex, selectionRange.endIndex);
    };

    _HighlightArea(inputBox, range) {
        inputBox.focus();
        inputBox.select();
        inputBox.selectionStart = range.startIndex;
        inputBox.endIndex = range.endIndex;
    }

    _SetValueAndNotifyObservers()
    {
        this._targetElement.value = this._formattedDuration.ToFormattedString();
        this._NotifySecondValueObservers(this._formattedDuration.ToTotalSeconds());
    }
    IncrementSeconds()
    {
        this._formattedDuration.AddSeconds(1);
        this._SetValueAndNotifyObservers();
    }

    _GetCursorPosition()
    {
        let field = this._targetElement;
        if (field.selectionStart || field.selectionStart === '0' || field.selectionStart === 0)
        {
            return field.selectionDirection==='backward' ? field.selectionStart : field.selectionEnd;
        }
        return null;
    }

    ResetSeconds(){
        this._formattedDuration.SetTotalSeconds(0);
        this._SetValueAndNotifyObservers();
    }

    _ChangeValueDueToUpOrDownArrowKeyPressed(targetElement, direction) {
        const selectedChunkName = targetElement.getAttribute(this.TIME_CHUNK_SELECTION_ATTR_NAME);
        if (direction === "up") {
            this._formattedDuration.IncrementValueForTimeChunk(selectedChunkName);
        } else if (direction === 'down') {
            this._formattedDuration.DecrementValueTimeChunk(selectedChunkName);
        }
        this._SetValueAndNotifyObservers();
        this._HighlightArea(targetElement, this._formattedDuration.GetIndexRangeForTimeChunk(selectedChunkName));
    };

    _ShiftFocusLeft(inputBox) {
        let chunkName = inputBox.getAttribute(this.TIME_CHUNK_SELECTION_ATTR_NAME);
        this._SetValueAndNotifyObservers();
        if (chunkName === this._formattedDuration.HOURS_CHUNK || chunkName === this._formattedDuration.MINUTES_CHUNK) {
            this._HighlightArea(inputBox, this._formattedDuration.GetIndexRangeForHoursChunk());
            return;
        }
        this._HighlightArea(inputBox, this._formattedDuration.GetIndexRangeForMinutesChunk());
    }

    _ShiftFocusRight(targetElement) {
        let chunkName = targetElement.getAttribute(this.TIME_CHUNK_SELECTION_ATTR_NAME);
        this._SetValueAndNotifyObservers();
        if (chunkName === this._formattedDuration.SECONDS_CHUNK || chunkName === this._formattedDuration.MINUTES_CHUNK) {
            this._HighlightArea(targetElement, this._formattedDuration.GetIndexRangeForSecondsChunk());// select hours area as it was selectee
            return;
        }
        this._HighlightArea(targetElement, this._formattedDuration.GetIndexRangeForMinutesChunk())
    }

    _SetFormattedStringFromTargetIfValid(event) {
        let currentValue = event.target.value;
        if (this._formattedDuration.IsFormattedStringValid(currentValue)) {
            this._formattedDuration.FromFormattedString(currentValue);
        }
    };

    _SetValueFromFormattedStringButDontLooseSelection(){
        let previousCursorPos = this._GetCursorPosition();
        if( previousCursorPos !== null)
        {
            let selectedChunkName = this._formattedDuration.GetSelectedTimeChunk(previousCursorPos);
            this._SetValueAndNotifyObservers();
            this._HighlightArea(this._targetElement, this._formattedDuration.GetIndexRangeForTimeChunk(selectedChunkName));
        }
        else
        {
            // "could not set value, previousCursorPos is null"
        }
    }

    _HandleKeyDown(event) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            switch (event.key) {
                // use up and down arrow keys to increase value;
                case 'ArrowDown':
                    this._ChangeValueDueToUpOrDownArrowKeyPressed(event.target, 'down');
                    break;
                case 'ArrowUp':
                    this._ChangeValueDueToUpOrDownArrowKeyPressed(event.target, 'up');
                    break;
                // use left and right arrow keys to shift focus;
                case 'ArrowLeft':
                    this._ShiftFocusLeft(event.target);
                    break;
                case 'ArrowRight':
                    this._ShiftFocusRight(event.target);
                    break;
            }
            event.preventDefault();
        }else if(event.key === 'Tab'){
            let chunkName = event.target.getAttribute(this.TIME_CHUNK_SELECTION_ATTR_NAME);
            // Shift focus right if not on seconds, else let tab do default
            if (chunkName !== this._formattedDuration.SECONDS_CHUNK) {
                this._ShiftFocusRight(event.target);
                event.preventDefault();
            }
        }
        // The following keys will be accepted when the input field is selected
        const acceptedKeys = ['Backspace', 'ArrowDown', 'ArrowUp', 'Tab'];
        if (isNaN(event.key) && !acceptedKeys.includes(event.key)) {
            event.preventDefault();
        }
    };

    constructor(formattedDuration) {
        this._formattedDuration = formattedDuration;
        this._secondValueObservers = [];
        this._targetElement = null;
    }

    SetPickerElement(targetElement) {
        // todo: add validation when target element is null or does not have some properties (e.g. value)
        if (targetElement.getAttribute('data-upgraded') === 'true') {
            return; // in case some developer calls this or includes it twice
        }
        this._targetElement = targetElement;
        targetElement.setAttribute('data-upgraded', true);
        targetElement.value = this._formattedDuration.ToFormattedString();
        this._ConnectEvents(targetElement);
        this._NotifySecondValueObservers(this._formattedDuration.ToTotalSeconds());
    }

    _NotifySecondValueObservers(newValue) {
        this._secondValueObservers.forEach(function (item, index, array) {
            // assuming that observer has method: setSecondsValue([int])
            item.setSecondsValue(newValue)
        })
    }

    AddSecondChangeObserver(secondChangeObservers) {
        this._secondValueObservers.push(secondChangeObservers);
        this._NotifySecondValueObservers(this._formattedDuration.ToTotalSeconds());
    }

    _OnKeyUpHandler(event) {
        this._SetFormattedStringFromTargetIfValid(event );
        this._NotifySecondValueObservers(this._formattedDuration.ToTotalSeconds());
    }

    _OnKeyDownHandler(event) {
        this._HandleKeyDown(event);
    }

    _OnSelectHandler(event) {
        this._SelectTextInTargetElement(event);
    }

    _OnMouseUpHandler(event) {
        this._SelectTextInTargetElement(event);
        this._SetValueFromFormattedStringButDontLooseSelection();
    }

    _OnChangeHandler(event) {
    }

    _OnBlurHandler(event) {
        this._SetFormattedStringFromTargetIfValid(event);
        this._SetValueAndNotifyObservers();
    }

    _ConnectEvents(pickerElement) {
        pickerElement.addEventListener('keydown', (event) => this._OnKeyDownHandler(event));
        pickerElement.addEventListener('select', (event) => this._OnSelectHandler(event));
        pickerElement.addEventListener('mouseup', (event) => this._OnMouseUpHandler(event));
        pickerElement.addEventListener('change', (event) => this._OnChangeHandler(event));
        pickerElement.addEventListener('blur', (event) => this._OnBlurHandler(event));
        pickerElement.addEventListener('keyup', (event) => this._OnKeyUpHandler(event));
        pickerElement.addEventListener('drop', (event) => event.preventDefault());
    }
}

