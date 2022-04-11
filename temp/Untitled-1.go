package main

import (
	"fmt"
	"time"
)

//无缓冲Channel
//注意进管道是chan <-,出管道是<- chan
func producer(out chan<- int) {
	for i := 0; i < 10; i++ {
		fmt.Println("生产者生产数据:", i)
		time.Sleep(time.Millisecond)
		out <- i
	}
	close(out)
}
func consumer(in <-chan int) {
	for data := range in {
		fmt.Println("消费者消费数据:", data)
	}
}
func main() {
	//无缓冲channel
	ch := make(chan int)
	//有缓冲channle
	//ch := make(chan int, 5)
	go producer(ch)
	consumer(ch)
}
