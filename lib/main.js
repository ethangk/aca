

var states 	= {addresses: []};

var labels 	= {};
var config 	= {	instructionLength: 4 , debug: false, reservationStationBufferSize: 3, reorderBufferSize: 20, issueWidth: 2};
var pipeline = {IF: null, DE: null, EX: null, MA: null, WB: null};
var clock 	= 0;

var unitRef;

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

function tick(IF,DE,EX,WR,CM){
	if(config.debug){
		console.log(registerBus.registers);
		console.log(PCBus.fetch());
		console.log(memoryBus.memory);
	}


	CM.run();
	WR.run();
	EX.run();
	DE.run();
	IF.run();



	clock++;
	return true;


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
	if(config.debug)
		console.log("LABELS", labels);
}

function fillMem(mem){
	mem.forEach(function(item){
		memoryBus.push(item.address*config.instructionLength, item.value);
	});
	if(config.debug)
		console.log("MEMORY", mem, memoryBus.memory);
}

function reset(numRegisters){
	instructionBus.reset();
	PCBus.reset();
	memoryBus.reset();
	registerBus.reset();
	registerBus.initReg(numRegisters);
	reorderBuffer.reset();
}

function run(objects){

	var loop = !objects.finished;
	while(loop){
		loop = tick(objects.IF, objects.DE, objects.EX, objects.WR, objects.CM);
		writeRegisters();
		writeMem();
	}
}

function nextStep(objects){
	if(objects.finished){
		return;
	}
	objects.finished = !tick(objects.IF, objects.DE, objects.EX, objects.WR, objects.CM);
	writeRegisters();
	writeMem();
}

function initProgram(){


	reservationStations.init([new reservationStation("art"), new reservationStation("art"), new reservationStation("art"),  new reservationStation("art"), new reservationStation("lsu"), new reservationStation("lsu")]);

	var IF = new instructionFetch();
	var DE = new decode(IF.bufferDE);
	var EX = new execute(DE.bufferEX);
	// var MA = new memoryAccess(EX.bufferMEM);
	// var WB = new writeBack(MA.bufferWB);
	var WR = new write();
	var CM = new commit();

	IF.initDecodeLink(DE);

	if(instructionBus.numInstructions === 0){
		console.log("NO INSTRUCTIONS");
		return false;
	}
	return {IF: IF, DE:DE, EX:EX,WR:WR, CM:CM, finished: false};

}