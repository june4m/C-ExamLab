/**
 * Stress Test for Compiler Service
 * Tests concurrent compilation requests and measures performance
 */

const API_URL = 'http://localhost:5000/compiler/compile' // Adjust your API endpoint
const CONCURRENT_REQUESTS = 40 // Number of simultaneous requests - Reduced to match MAX_CONCURRENT_COMPILATIONS
const TOTAL_REQUESTS = 500 // Total number of requests to send

// Test programs
const testPrograms = [
	{
		name: 'Simple Addition',
		code: `#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b);
    return 0;
}`,
		input: '5 7',
		expectedOutput: '12'
	},
	{
		name: 'Factorial',
		code: `#include <stdio.h>
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
int main() {
    int n;
    scanf("%d", &n);
    printf("%d", factorial(n));
    return 0;
}`,
		input: '5',
		expectedOutput: '120'
	},
	{
		name: 'Fibonacci',
		code: `#include <stdio.h>
int fib(int n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
}
int main() {
    int n;
    scanf("%d", &n);
    printf("%d", fib(n));
    return 0;
}`,
		input: '10',
		expectedOutput: '55'
	},
	{
		name: 'Array Sum',
		code: `#include <stdio.h>
int main() {
    int n, sum = 0;
    scanf("%d", &n);
    for(int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        sum += x;
    }
    printf("%d", sum);
    return 0;
}`,
		input: '5\n1 2 3 4 5',
		expectedOutput: '15'
	},
	{
		name: 'Prime Check',
		code: `#include <stdio.h>
#include <math.h>
int isPrime(int n) {
    if (n <= 1) return 0;
    if (n <= 3) return 1;
    if (n % 2 == 0 || n % 3 == 0) return 0;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0)
            return 0;
    }
    return 1;
}
int main() {
    int n;
    scanf("%d", &n);
    printf("%d", isPrime(n));
    return 0;
}`,
		input: '17',
		expectedOutput: '1'
	}
]

// Statistics
const stats = {
	total: 0,
	success: 0,
	failed: 0,
	errors: 0,
	times: [],
	compilationTimes: [],
	executionTimes: [],
	rateLimited: 0,
	serverBusy: 0
}

async function sendRequest(program, requestNum) {
	const startTime = Date.now()

	try {
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				code: program.code,
				input: program.input,
				timeLimit: 1000,
				memoryLimit: 256,
				optimizationLevel: 0
			})
		})

		const responseTime = Date.now() - startTime
		const data = await response.json()

		stats.total++
		stats.times.push(responseTime)

		if (response.status === 429) {
			stats.rateLimited++
			console.log(`❌ Request #${requestNum} [${program.name}]: Rate limited`)
			return { success: false, rateLimited: true }
		}

		if (!response.ok) {
			stats.errors++
			console.log(
				`❌ Request #${requestNum} [${program.name}]: HTTP ${response.status}`
			)
			return { success: false, error: true }
		}

		if (data.success) {
			if (data.compilationTime)
				stats.compilationTimes.push(data.compilationTime)
			if (data.executionTime) stats.executionTimes.push(data.executionTime)

			const outputMatches = data.output?.trim() === program.expectedOutput
			if (outputMatches) {
				stats.success++
				console.log(
					`✅ Request #${requestNum} [${program.name}]: ${responseTime}ms (compile: ${data.compilationTime}ms, exec: ${data.executionTime}ms)`
				)
			} else {
				stats.failed++
				console.log(
					`⚠️  Request #${requestNum} [${program.name}]: Output mismatch - got "${data.output}" expected "${program.expectedOutput}"`
				)
			}
		} else {
			if (data.error?.includes('Server is busy')) {
				stats.serverBusy++
			} else {
				stats.failed++
			}
			console.log(
				`❌ Request #${requestNum} [${program.name}]: ${
					data.error || data.compilationError
				}`
			)
		}

		return { success: data.success, responseTime, data }
	} catch (error) {
		stats.total++
		stats.errors++
		console.log(`💥 Request #${requestNum} [${program.name}]: ${error.message}`)
		return { success: false, error: true }
	}
}

async function runStressTest() {
	console.log('🚀 Starting Compiler Stress Test')
	console.log(`📊 Configuration:`)
	console.log(`   - Total Requests: ${TOTAL_REQUESTS}`)
	console.log(`   - Concurrent Requests: ${CONCURRENT_REQUESTS}`)
	console.log(`   - API Endpoint: ${API_URL}`)
	console.log(`   - Test Programs: ${testPrograms.length}`)
	console.log('')

	const startTime = Date.now()
	const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS)

	for (let batch = 0; batch < batches; batch++) {
		const batchSize = Math.min(
			CONCURRENT_REQUESTS,
			TOTAL_REQUESTS - batch * CONCURRENT_REQUESTS
		)
		const requests = []

		console.log(
			`\n📦 Batch ${batch + 1}/${batches} - Sending ${batchSize} requests...`
		)

		for (let i = 0; i < batchSize; i++) {
			const requestNum = batch * CONCURRENT_REQUESTS + i + 1
			const program = testPrograms[requestNum % testPrograms.length]
			requests.push(sendRequest(program, requestNum))
		}

		await Promise.all(requests)

		// Small delay between batches to avoid overwhelming the server
		if (batch < batches - 1) {
			await new Promise(resolve => setTimeout(resolve, 100))
		}
	}

	const totalTime = Date.now() - startTime

	// Calculate statistics
	const avgTime = stats.times.reduce((a, b) => a + b, 0) / stats.times.length
	const minTime = Math.min(...stats.times)
	const maxTime = Math.max(...stats.times)
	const p50 = stats.times.sort((a, b) => a - b)[
		Math.floor(stats.times.length * 0.5)
	]
	const p95 = stats.times.sort((a, b) => a - b)[
		Math.floor(stats.times.length * 0.95)
	]
	const p99 = stats.times.sort((a, b) => a - b)[
		Math.floor(stats.times.length * 0.99)
	]

	const avgCompilation =
		stats.compilationTimes.length > 0
			? stats.compilationTimes.reduce((a, b) => a + b, 0) /
			  stats.compilationTimes.length
			: 0
	const avgExecution =
		stats.executionTimes.length > 0
			? stats.executionTimes.reduce((a, b) => a + b, 0) /
			  stats.executionTimes.length
			: 0

	// Print results
	console.log('\n')
	console.log('='.repeat(60))
	console.log('📊 STRESS TEST RESULTS')
	console.log('='.repeat(60))
	console.log(`\n⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`)
	console.log(
		`📈 Throughput: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)} req/s`
	)
	console.log(
		`\n✅ Success: ${stats.success}/${stats.total} (${(
			(stats.success / stats.total) *
			100
		).toFixed(2)}%)`
	)
	console.log(`❌ Failed: ${stats.failed}`)
	console.log(`💥 Errors: ${stats.errors}`)
	console.log(`⏱️  Rate Limited: ${stats.rateLimited}`)
	console.log(`🚦 Server Busy: ${stats.serverBusy}`)

	console.log(`\n⏱️  Response Time Statistics:`)
	console.log(`   - Average: ${avgTime.toFixed(2)}ms`)
	console.log(`   - Min: ${minTime}ms`)
	console.log(`   - Max: ${maxTime}ms`)
	console.log(`   - P50 (median): ${p50}ms`)
	console.log(`   - P95: ${p95}ms`)
	console.log(`   - P99: ${p99}ms`)

	if (stats.compilationTimes.length > 0) {
		console.log(`\n🔨 Compilation Time:`)
		console.log(`   - Average: ${avgCompilation.toFixed(2)}ms`)
		console.log(`\n▶️  Execution Time:`)
		console.log(`   - Average: ${avgExecution.toFixed(2)}ms`)
	}

	console.log('\n' + '='.repeat(60))

	// Performance assessment
	console.log('\n📝 Assessment:')
	if (avgTime < 100) {
		console.log('   🌟 EXCELLENT - Average response time < 100ms')
	} else if (avgTime < 200) {
		console.log('   ✅ GOOD - Average response time < 200ms')
	} else if (avgTime < 500) {
		console.log('   ⚠️  ACCEPTABLE - Average response time < 500ms')
	} else {
		console.log(
			'   ❌ SLOW - Average response time > 500ms, needs optimization'
		)
	}

	const successRate = (stats.success / stats.total) * 100
	if (successRate >= 99) {
		console.log('   🌟 EXCELLENT - Success rate >= 99%')
	} else if (successRate >= 95) {
		console.log('   ✅ GOOD - Success rate >= 95%')
	} else if (successRate >= 90) {
		console.log('   ⚠️  ACCEPTABLE - Success rate >= 90%')
	} else {
		console.log('   ❌ POOR - Success rate < 90%, investigate failures')
	}

	console.log('')
}

// Run the stress test
runStressTest().catch(console.error)
