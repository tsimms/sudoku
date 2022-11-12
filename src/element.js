class Element {
    constructor () {
        this.element = null;
        this.possible = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    }

    get = () => this.element ? this.element : null;
    getPossible = () => this.possible;
    set = (number) => { this.element = number }
    cantBe = value => { 
        const index = this.possible.indexOf(value);
        if (!(index < 0))
            this.possible.splice(index,1)
    };
    isSet = () => this.element !== null;
    hasAbsolute = () => this.possible.length === 1;
    setAbsolute = () => this.set(this.possible[0]);
    hasFailed = () => this.possible.length === 0;
}

module.exports = Element;