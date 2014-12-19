start
	ldr $r0, numItems
	mov $r1, #-1
	mov $r5, #0
loop
	sub $r0, $r0, #1
	bneq loopBulk, $r0, $r1
	jmp end
loopBulk
	mul $r6, $r0, #4
	ldrn $r2, [$r6,arrayA]
	ldrn $r3, [$r6,arrayB]
	add $r4, $r2, $r3
	add $r5, $r5, $r4
	jmp loop
end
	hlt
numItems
	.word 10
arrayA
	.word 1, 2, 3, 4, 5, 1, 2, 3, 4, 5
arrayB
	.word 9, 8, 7, 6, 5, 9, 8, 7, 6, 5