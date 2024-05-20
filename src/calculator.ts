export class Calculator {
  private _expression: string = '0'; // The expression to be evaluated
  
  getExpression(): string {
    return this._expression;
  }

  handleInput(input: string): void {
    if (this._expression === 'Error') {
      this._expression = '0';
    }
    switch (input) {
      case 'C':
        this._expression = '0';
        break;
      case 'CE':
        this._expression = this._expression.slice(0, -1) || '0';
        break;
      case '=':
        this.evaluateExpression();
        return;
      default:
        if (this._expression === '0') {
          this._expression = input;
        } else {
          this._expression += input;
        }
    }
  }

  private evaluateExpression(): void {
    try {
      this._expression = eval(this._expression.replace('x', '*')).toString();
    } catch {
      this._expression = 'Error';
    }
  }
}