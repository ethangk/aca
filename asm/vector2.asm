start
	ldr $r0, numItems
	mov $r1, #-1
	mov $r5, #0
	mov $r7, arrayA
	mov $r8, arrayB
loop
	sub $r0, $r0, #1
	beq end, $r0, $r1
	mul $r6, $r0, #4
	ldrn $r2, [$r6,$r7]
	ldrn $r3, [$r6,$r8]
	add $r4, $r2, $r3
	add $r5, $r5, $r4
	jmp loop
end
	hlt
numItems
	.word 5
arrayA
	.word 1, 2, 3, 4, 5
arrayB
	.word 9, 8, 7, 6, 5