/*

#ADD [opcode-4 bits][return reg - 5 bits][r1 - 5 bits][r2 - 5 bits][imm val - 13]
#SUB Same as above
#AND Same as above, if imm is 0 default to 1
#OR  Same as AND, except imm doesnt default to 1
#NOR Same as AND
#SLL [opcode 4 bits][reg to be shifted - 5 bits][]


*/


function Instruction(iValue){

	return {
		value: 0,
		bitString: 0,
		parts: null,
		opType: null,
		opCode: null,

		decode: function(){
				if(iValue > 0 && iValue<4294967296){

						this.value 		= iValue;
						this.bitString 	= iValue.toString(2);
						if(this.bitString.length < 32){
							this.bitString = new Array(33-this.bitString.length).join('0') + this.bitString;
						}
						this.parts 		= [this.bitString.substr(0,5), this.bitString.substr(5,5), this.bitString.substr(10, 5), this.bitString.substr(15)];
						this.opCode 	= this.parts[0];
						if(this.opCode >= 0 && this.opCode < 7){
							this.opType = "A";
						}
						else if(this.opCode >= 7 && this.opCode < 11){
							this.opType = "B";
						}
						else if(this.opCode >= 11 && this.opCode < 13){
							this.opType = "M";
						}
						else{
							this.opType = "H";
						}
						return {value: this.value, bitString: this.bitString, parts: this.parts, opCode: this.opCode, opType: this.opType};
					}
					return false;
				}
		,

		fetchReg: function(registers){
			if(this.opType === null){
				return false;
			}			

		}
	}

};
