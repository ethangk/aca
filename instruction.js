/*
A TYPE
#MOV [opcode 5 bits][imm 27 bits]


B TYPE
#ADD [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] r0 = r1 + r2 + imm
#SUB [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] r0 = r1 - r2 - imm
#MUL [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] r0 = r1 * r2 * imm (if imm = 0, default to 1)
#DIV [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] r0 = r1 / r2 / imm (if imm = 0, default to 1)
#AND [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] if imm is 0 default to 1
#OR  [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] except imm doesnt default to 1
#NOR [opcode 5 bits][return reg 5 bits][r1 5 bits][r2 5 bits][imm val 12 bits] if imm is 0 default to 1

C TYPE
#SLL [opcode 5 bits][shift  reg 5 bits][shift imm 22] (shift left logical)
#SRL [opcode 5 bits][shift  reg 5 bits][shift imm 22] (shift right logical)

D TYPE
#SLT [opcode 5 bits][return reg 5 bits][reg1 5 bits][reg2 5 bits] (return true if one reg is less than another)


E TYPE
#JMP [opcode 5 bits][imm 27 bits]

F TYPE
#JMR [opcode 5 bits][reg 5  bits]

F TYPE
#BEQ [opcode 5 bits][dest reg 5 bits][r1 5 bits][r2 5 bits][offset 17 bits] branch if equal
#BNE [opcode 5 bits][dest reg 5 bits][r1 5 bits][r2 5 bits][offset 17 bits] branch if not equal

G TYPE
#BLEZ[opcode 5 bits][dest reg 5 bits][r1 5 bits][offset 22 bits] branch if less than or equal to 0
#BGTZ[opcode 5 bits][dest reg 5 bits][r1 5 bits][offset 22 bits] branch if greater than or equal to 0


H TYPE
#LDR [opcode 5 bits][return reg 5 bits][addr reg 5 bits][offset 17 bits]
#STR [opcode 5 bits][origin reg 5 bits][addr reg 5 bits][offset 17 bits]


I TYPE
#HLT [opcode 5 bits]
#NOP [opcode 5 bits]


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
						this.parts 		= [];
						this.parts 		= [this.bitString.substr(0,5), this.bitString.substr(5,5), this.bitString.substr(10, 5), this.bitString.substr(15)];
						this.opCode 	= this.bitString.substr(0,5);
						if(this.opCode === 0){
							this.opType = "A";
						}
						else if(this.opCode > 0 && this.opCode <= 7){
							this.opType = "B";
							this.parts 	= [this.bitString.substr(0,5), this.bitString.substr(5,5), this.bitString.substr(10, 5), this.bitString.substr(15, 5), this.bitString.substr(20)];
							
						}
						else if(this.opCode > 7 && this.opCode <= 9){
							this.opType = "C";
							this.parts 	= [this.bitString.substr(0,5), this.bitString.substr(5,5), this.bitString.substr(22)];
						}
						else if(this.opCode === 10){
							this.opType = "D";
							this.parts 	= [this.bitString.substr(0,5), this.bitString.substr(5,5), this.bitString.substr(10, 5), this.bitString.substr(15, 5)];
						}
						else if(this.opCode === 11){
							this.opType = "E";
							this.parts 	= [this.bitString.substr(0,5), this.bitString.substr(5,5), this.bitString.substr(10, 5), this.bitString.substr(15, 5)];
						}
						else if(this.opCode === 12){
							this.opType = "F";
						}
						else if(this.opCode > 12 && this.opCode <= 14{
							this.opType = "G";
						}
						else if(this.opCode > 14 && this.opCode <= 16){
							this.opType = "H";
						}
						else if(this.opCode > 16 && this.opCode < 18){
							this.opType = "I";
						}
						else{
							this.opType = "J";
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
			switch(this.opType){
				case "A":
					//do nothing..?
				break;
				case "B":
					return {r1: registers[]}
				break;
			}	

		}
	}

};
