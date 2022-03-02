package main

func maxSubArray(nums []int) int {
	result := nums[0]
	prev := nums[0]
	for i := 1; i < len(nums); i++ {
		prev = max(prev+nums[i], nums[i])
		result = max(result, prev)
	}

	return result
}
func max(a, b int) int {
	if a > b {
		return a
	} else {
		return b
	}
}

// func main() {
// 	var leng int
// 	for {
// 		n, _ := fmt.Scan(&leng)
// 		if n == 0 {
// 			break
// 		}
// 		g := make([]int, 0)
// 		var temp int
// 		for i := 0; i < leng; i++ {
// 			_, _ = fmt.Scanf("%d,", &temp)
// 			g = append(g, temp)
// 			fmt.Println(g)
// 		}

// 		// result := wiggleMaxLength(g)
// 		// fmt.Println(result)
// 		// return
// 	}
// }
