//Convert object into array to be able to iterate through it since X2JS returns object for single node
Object.defineProperty(Object.prototype, 'toArray', {
    value: function () {
        return this.constructor === Array ? this : [].concat(this);
    },
    enumerable: false
});