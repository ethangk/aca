function commit(IF){
	this.IF = IF;
}

commit.prototype.run = function(){
	for(var i = 0; i<config.issueWidth; i++){
		var head = reorderBuffer.values[reorderBuffer.getPointer()];
		if(!head)
			return;

		if(config.debug){
			console.log("ROB", reorderBuffer.getPointer(), head);
		}

		if(head.ready){
			if(head.value === true && head.instruction.opCode.charAt(0) !== "b"){
				console.log(head);
				throw false;
			}
			// console.log("COMMIT", reorderBuffer.pointer, head);
			var d = head.destination;

			if(head.instruction.opCode === "hlt"){
				// console.log("HLT in ROB");
				finished = true;
				return;
			}
			else if(head.instruction.opCode.charAt(0) === "b"){
				if(head.value){
					//branch should have been taken
					
				}
				else{
					//branch shouldnt have been taken, flush the ROB, restore state, move back pc
					var iterations = reorderBuffer.valuesLength - reorderBuffer.getPointer(); 
					for(var i = reorderBuffer.getPointer(), len = reorderBuffer.valuesLength; i<len; i++){
						// delete reorderBuffer.values[i];
						reorderBuffer.deleteItem(i);
					}
					reorderBuffer.latestStore = 0;
					// reorderBuffer.valuesLength -= iterations;
					this.IF.clearBuffer();

					registerBus.clearState();
					PCBus.push(head.storedPC);
					return;
				}
				// this.fetchCompletedInstruction();
			}
			else if(head.instruction.opCode === "str"){
				//desination address
				memoryBus.push(head.address, head.value);
				if(head.id === reorderBuffer.latestStore){
					//latest store is done, lets update
					for(var k = reorderBuffer.latestStore+1; k<reorderBuffer.values.length; k++){
						if(reorderBuffer.values[k].instruction.opCode === "str"){
							reorderBuffer.latestStore = k;
							break;
						}
					}
					if(head.id === reorderBuffer.latestStore){
						//no update was made to latestStore
						reorderBuffer.latestStore = 0;
					}
				}
			}
			else{
				registerBus.push(d, head.value);
			}
			head.busy = false;
			// reorderBuffer.pointer++;
			reorderBuffer.changePointer(1);
			if(d === false)
				return;
			var regStat = registerBus.getStatus(d);
			if(regStat.reorder === head.id)
				registerBus.pushStatus(d,false,0);
		}
	}
}