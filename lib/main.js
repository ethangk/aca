

var states = {addresses: []};

var labels = {};
var config = {	instructionLength: 4 , debug: false};

/*

High level pipeline overview
IF pulls an instruction from memory
DE works out what the instruciton wants, fetches values from registers
EX actually executes the instruction
WB writes values back to the registers

*/


function updateState(address, registers){
	states[address] = registers;
	states['addresses'].push(address);

	if(states.addresses.length > 20){
		delete states[states.addresses[0]];
		states.addresses.shift();	
	}
}

function tick(IF,DC,EX,MA,WB){
	if(config.debug){
		console.log(registerBus.registers);
		console.log(PCBus.fetch());
		console.log(memoryBus.memory);
	}
	return WB.run(	MA.run(EX.run(	DC.run(	IF.run()))));
	// updateState(pc, registers);
}

function fillInstructions(inst){
	var tempPC = 0;
	inst.forEach(function(v){
		instructionBus.push(tempPC, v);
		tempPC+=config.instructionLength;
	});
}

function fillLabels(lab){
	lab.forEach(function(item){
		labels[item.label] = item.currentInstruction*config.instructionLength;
	});
	console.log("LABELS", labels);
}

function fillMem(mem){
	mem.forEach(function(item){
		memoryBus.push(item.address*config.instructionLength, item.value);
	});
	console.log("MEMORY", mem, memoryBus.memory);
}

function reset(numRegisters){
	instructionBus.reset();
	PCBus.reset();
	memoryBus.reset();
	registerBus.reset();
	registerBus.initReg(numRegisters);
}

function run(objects){

	var loop = !objects.finished;
	while(loop){
		loop = tick(objects.IF, objects.DC, objects.EX, objects.MA, objects.WB);
		writeRegisters();
		writeMem();
	}
}

function nextStep(objects){
	if(objects.finished){
		return;
	}
	objects.finished = !tick(objects.IF, objects.DC, objects.EX, objects.MA, objects.WB);
	writeRegisters();
	writeMem();
}

function initProgram(){
	console.log("INTRUCTIONS:", instructionBus.instructions);
	var IF = new instructionFetch();
	var DC = new decode();
	var EX = new execute();
	var MA = new memoryAccess();
	var WB = new writeBack();

	console.log(instructionBus.numInstructions);
	if(instructionBus.numInstructions === 0){
		console.log("NO INSTRUCTIONS");
		return false;
	}
	return {IF: IF, DC:DC, EX:EX,MA:MA, WB:WB, finished: false};

}