package main

import "fmt"

func quicksort(array []int, l, r int) {
	if l >= r {
		return
	}
	// 哨兵划分操作（以 arr[l] 作为基准数）
	i := l
	j := r
	for i < j {
		for i < j && array[j] >= array[l] {
			j--
		}
		for i < j && array[i] <= array[l] {
			i++
		}
		array[i], array[j] = array[j], array[i]
	}
	//交换基准
	array[i], array[l] = array[l], array[i]
	// 递归左（右）子数组执行哨兵划分
	quicksort(array, l, i-1)
	quicksort(array, i+1, r)
}
func testa(array []int, l, r int) {
	if l >= r {
		return
	}
	i, j := l, r
	for i < j {
		for i < j && array[j] >= array[l] {
			j--
		}
		for i < j && array[i] <= array[l] {
			i++
		}
		array[i], array[j] = array[j], array[i]
	}
	array[i], array[l] = array[l], array[i]
	testa(array, l, i-1)
	testa(array, i+1, r)
}

func main() {
	test := []int{2, 3, 4, 1, 0, 10, 100, 4}
	testa(test, 0, len(test)-1)
	fmt.Println(test)
}
