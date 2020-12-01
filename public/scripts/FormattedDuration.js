class FormattedDuration {

    DEFAULT_HOURS_UNIT = ":";
    DEFAULT_MINUTES_UNIT = ":";
    DEFAULT_SECONDS_UNIT = "";

    SECONDS_IN_HOUR = 3600;
    SECONDS_IN_MINUTE = 60;
    ONE_SECOND = 1;


    constructor(config = {
        hoursUnitString: ":",
        minutesUnitString: ":",
        secondsUnitString: ""
    }) {
        this.SECONDS_CHUNK = "seconds";
        this.MINUTES_CHUNK = "minutes";
        this.HOURS_CHUNK = "hours";
        this.CHUNK_OUT_OF_RANGE = "OutOfRange";

        this._hoursUnit = this.DEFAULT_HOURS_UNIT;
        this._minutesUnit = this.DEFAULT_MINUTES_UNIT;
        this._secondsUnit = this.DEFAULT_SECONDS_UNIT;

        if (config.hasOwnProperty("hoursUnitString")) {
            this._hoursUnit = config.hoursUnitString;
        }

        if (config.hasOwnProperty("minutesUnitString")) {
            this._minutesUnit = config.minutesUnitString;
        }

        if (config.hasOwnProperty("secondsUnitString")) {
            this._secondsUnit = config.secondsUnitString;
        }

        this._ValidateInternalStateOrThrow();
        this._seconds = 0;
        this._minutes = 0;
        this._hours = 0;
        this._totalSeconds = 0;
    }

    _ValidateInternalStateOrThrow() {

        var hourRegex = new RegExp("^\\D(.*\\D)?$", "g");
        var minuteRegex = new RegExp("^\\D(.*\\D)?$", "g");

        if (this._hoursUnit.length === 0) {
            throw new Error("hour unit cannot be empty");
        }

        if (this._minutesUnit.length === 0) {
            throw new Error("minute unit cannot be empty");
        }

        if (!hourRegex.test(this._hoursUnit)) {
            throw new Error("invalid hour unit '" + this._hoursUnit + "'");
        }

        if (!minuteRegex.test(this._minutesUnit)) {
            throw new Error("invalid minute unit '" + this._minutesUnit + "'");
        }
    }

    _FormattedHours() {
        return ("" + this._hours).padStart(2, "0");
    }

    _FormattedMinutes() {
        return ("" + this._minutes).padStart(2, "0");
    }

    _FormattedSeconds() {
        return ("" + this._seconds).padStart(2, "0")
    }

    _FormattedHoursWithUnit() {
        return this._FormattedHours() + this._hoursUnit;
    }

    _FormattedMinutesWithUnit() {
        return this._FormattedMinutes() + this._minutesUnit;
    }

    _FormattedSecondsWithUnit() {
        return this._FormattedSeconds() + this._secondsUnit;
    }

    _GetIntegerOrNan(value) {
        if (typeof value === 'string' && value.length === 0) {
            return NaN;
        }
        let n = Number(value);
        if (isNaN(n)) {
            return NaN;
        }
        if (Number.isInteger(n)) {
            return n;
        }
        return NaN;
    }

    ToFormattedString() {

        return this._FormattedHoursWithUnit() +
            this._FormattedMinutesWithUnit() +
            this._FormattedSecondsWithUnit();
    }

    ToTotalSeconds() {
        return this._totalSeconds;
    }

    AddSeconds(seconds) {
        this.SetTotalSeconds(this._totalSeconds + seconds);
    }

    SubtractSeconds(seconds) {
        let intSeconds = this._GetIntegerOrNan(seconds);
        if(isNaN(intSeconds) || intSeconds < 0){
            return;
        }

        if (this._totalSeconds - intSeconds < 0) {
            return;
        }
        this._totalSeconds -= intSeconds;
        this._ResetFromTotalSeconds();
    }

    SetTotalSeconds(seconds) {
        // todo: what is max value ?
        let intSeconds = this._GetIntegerOrNan(seconds);
        if(isNaN(intSeconds) || intSeconds < 0){
            return;
        }

        // todo , validate input
        // value must be int and not negative
        // and not bigger then .. figure out max value
        this._totalSeconds = seconds;
        this._ResetFromTotalSeconds()
    }

    _ResetFromTotalSeconds() {
        this._hours = Math.floor(this._totalSeconds / this.SECONDS_IN_HOUR);
        this._minutes = Math.floor((this._totalSeconds % this.SECONDS_IN_HOUR) / this.SECONDS_IN_MINUTE);
        this._seconds = Math.floor((this._totalSeconds % this.SECONDS_IN_HOUR) % this.SECONDS_IN_MINUTE);
    }

    _RecalculateTotalSeconds(hours, minutes, seconds) {
        if (Number.isInteger(hours)) {
            this._hours = hours;
        }

        if (Number.isInteger(minutes)) {
            this._minutes = minutes;
        }

        if (Number.isInteger(seconds)) {
            this._seconds = seconds;
        }

        this._totalSeconds = this._hours * this.SECONDS_IN_HOUR +
            this._minutes * this.SECONDS_IN_MINUTE +
            this._seconds;

        //console.log(`Realculated to ${this._hours}:${this._minutes}:${this._seconds}`);
    }

    FromFormattedString(formattedString) {
        // todo: validate if value is not a string
        // cut the string into pieces
        // and extract each value from it
        let spitedChunks = this._ExtractTimeValuesFromFormattedString(formattedString);
        let [hours, minutes, seconds] = spitedChunks;
        this._RecalculateTotalSeconds(hours, minutes, seconds);
    }



    // always return table with thre
    _ExtractTimeValuesFromFormattedString(formattedString) {
        const hoursUnitStringIndex = formattedString.indexOf(this._hoursUnit);
        if (hoursUnitStringIndex < 0) {
            return [NaN, NaN, NaN];
        }
        const hoursAsString = formattedString.substring(0, hoursUnitStringIndex);
        const hoursInt = this._GetIntegerOrNan(hoursAsString);

        let minutesTextStartIndex = hoursUnitStringIndex + this._hoursUnit.length;
        const minuteUnitStringIndex = formattedString.indexOf(this._minutesUnit, minutesTextStartIndex);

        if (minuteUnitStringIndex < 0) {
            return [hoursInt, NaN, NaN];
        }
        const minuteAsString = formattedString.substring(minutesTextStartIndex, minuteUnitStringIndex);

        const minutesInt = this._GetIntegerOrNan(minuteAsString);


        let secondsTextStartIndex =  minuteUnitStringIndex + this._minutesUnit.length;

        let secondsAsString = "";
        if(this._secondsUnit.length !== 0 ) // seconds unit can be empty
        {
            const secondUnitStringIndex = formattedString.indexOf(this._secondsUnit, secondsTextStartIndex);
            secondsAsString = formattedString.substring(secondsTextStartIndex,secondUnitStringIndex);
        }
        else{
            secondsAsString = formattedString.substring(secondsTextStartIndex, formattedString.length);
        }

        const secondsInt = this._GetIntegerOrNan(secondsAsString);
        return [hoursInt, minutesInt, secondsInt];
    }

    IsFormattedStringValid(formattedString){
        let resultArray = this._ExtractTimeValuesFromFormattedString(formattedString);
        let isAllValusNonNaNs =  resultArray.every((item)=>{
            return !isNaN(item);
        });
        if(! isAllValusNonNaNs )
        {
            return false;
        }

        let hours = resultArray[0];
        let minutes = resultArray[1];
        let seconds = resultArray[2];
        return hours >= 0 && minutes < 60 && minutes >= 0 && seconds < 60 && seconds >= 0;

    }

    GetSelectedTimeChunk(position) {
        // todo validate if position is not an int
        if (position < 0) {
            return this.CHUNK_OUT_OF_RANGE
        }

        let hourChunkPositionStart = 0;
        let hourChunkLength = this._FormattedHoursWithUnit().length;
        let hourChunkPositionEnd = hourChunkPositionStart + hourChunkLength - 1;


        if ((position >= hourChunkPositionStart) && (position <= hourChunkPositionEnd)) {
            return this.HOURS_CHUNK;
        }

        let minuteChunkPositionStart = hourChunkPositionEnd + 1;
        let minuteChunkLength = this._FormattedMinutesWithUnit().length;
        let minuteChunkPositionEnd = minuteChunkPositionStart + minuteChunkLength - 1;

        if ((position >= minuteChunkPositionStart) && (position <= minuteChunkPositionEnd)) {
            return this.MINUTES_CHUNK;
        }

        let secondChunkPositionStart = minuteChunkPositionEnd + 1;
        let secondChunkLength = this._FormattedSecondsWithUnit().length;
        let secondChunkPositionEnd = secondChunkPositionStart + secondChunkLength - 1;

        if ((position >= secondChunkPositionStart) && (position <= secondChunkPositionEnd + 1)) {
            return this.SECONDS_CHUNK;
        }

        return this.CHUNK_OUT_OF_RANGE;
    }

    // returns object with startIndex,endIndex
    // return -1, -1 if not recognized type
    GetIndexRangeForTimeChunk(chunkName) {

        // todo should throw if chunkName is not known
        let hourChunkEndIndex = this._FormattedHours().length;
        if (chunkName === this.HOURS_CHUNK) {
            return {startIndex: 0, endIndex: hourChunkEndIndex}
        }

        let minuteChunkStartIndex = hourChunkEndIndex + this._hoursUnit.length;
        let minuteChunkEndIndex = minuteChunkStartIndex + this._FormattedMinutes().length;
        if (chunkName === this.MINUTES_CHUNK) {
            return {startIndex: minuteChunkStartIndex, endIndex: minuteChunkEndIndex}
        }

        let secondChunkStartIndex = minuteChunkEndIndex + this._minutesUnit.length;
        let secondsChunkEndIndex = secondChunkStartIndex + this._FormattedSeconds().length;
        if (chunkName === this.SECONDS_CHUNK) {
            return {startIndex: secondChunkStartIndex, endIndex: secondsChunkEndIndex}
        }
    }


    GetIndexRangeForSecondsChunk() {
        return this.GetIndexRangeForTimeChunk(this.SECONDS_CHUNK);
    }

    GetIndexRangeForMinutesChunk() {
        return this.GetIndexRangeForTimeChunk(this.MINUTES_CHUNK);
    }

    GetIndexRangeForHoursChunk() {
        return this.GetIndexRangeForTimeChunk(this.HOURS_CHUNK);
    }

    IncrementValueForTimeChunk(chunkName) {
        if (chunkName === this.HOURS_CHUNK) {
            this.AddSeconds(this.SECONDS_IN_HOUR);
        } else if (chunkName === this.MINUTES_CHUNK) {
            this.AddSeconds(this.SECONDS_IN_MINUTE);
        } else if (chunkName === this.SECONDS_CHUNK) {
            this.AddSeconds(this.ONE_SECOND);
        }
    }

    DecrementValueTimeChunk(chunkName) {
        if (chunkName === this.HOURS_CHUNK) {
            this.SubtractSeconds(this.SECONDS_IN_HOUR);
        }
        else if(chunkName === this.MINUTES_CHUNK)
        {
            this.SubtractSeconds(this.SECONDS_IN_MINUTE);
        }
        else if(chunkName === this.SECONDS_CHUNK)
        {
            this.SubtractSeconds(this.ONE_SECOND);
        }
    }

    // todo: bug:  when user sets e.g. 345 seconds in the input element and then pushes ArrowLeft key, the value stays
    // todo bug: when user sets e.g. 345 seconds and then pushes key up, some strange value appears

}
