'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Home,
  Calculator,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Percent,
  Clock,
  Banknote,
  TrendingDown,
  ChevronDown,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Currency formatter ────────────────────────────────────────────────
const fmt = new Intl.NumberFormat('en-ZM', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function currency(n: number): string {
  return `ZMW ${fmt.format(Math.round(n))}`
}

// ─── Amortisation helpers ─────────────────────────────────────────────
interface YearRow {
  year: number
  principalPaid: number
  interestPaid: number
  balanceRemaining: number
}

function computeAmortisation(
  loan: number,
  monthlyRate: number,
  months: number
): YearRow[] {
  const rows: YearRow[] = []
  const m =
    monthlyRate === 0
      ? loan / months
      : (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)

  let balance = loan
  for (let y = 1; y <= Math.ceil(months / 12); y++) {
    let principal = 0
    let interest = 0
    const monthsThisYear = Math.min(12, months - (y - 1) * 12)
    for (let mo = 0; mo < monthsThisYear; mo++) {
      const intPart = balance * monthlyRate
      const prinPart = m - intPart
      interest += intPart
      principal += prinPart
      balance -= prinPart
    }
    if (balance < 0) balance = 0
    rows.push({
      year: y,
      principalPaid: principal,
      interestPaid: interest,
      balanceRemaining: balance,
    })
  }
  return rows
}

// ─── Tab 1: Mortgage Calculator ────────────────────────────────────────
function MortgageCalculator() {
  const [price, setPrice] = useState(500000)
  const [downPayment, setDownPayment] = useState(100000)
  const [rate, setRate] = useState(25)
  const [term, setTerm] = useState(20)
  const [calculated, setCalculated] = useState(false)

  const preset20 = () => setDownPayment(Math.round(price * 0.2))

  const results = useMemo(() => {
    const loan = price - downPayment
    if (loan <= 0) return null
    const monthlyRate = rate / 100 / 12
    const months = term * 12
    const monthly =
      monthlyRate === 0
        ? loan / months
        : (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1)
    const total = monthly * months
    const totalInterest = total - loan
    const amortisation = computeAmortisation(loan, monthlyRate, months)
    return { monthly, total, totalInterest, loan, amortisation }
  }, [price, downPayment, rate, term])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ── Input Card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Mortgage Details
        </h3>

        {/* Property Price */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Property Price (ZMW)</Label>
            <Input
              type="number"
              min={10000}
              max={5000000}
              step={10000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-11 text-base"
            />
            <Slider
              min={10000}
              max={5000000}
              step={10000}
              value={[price]}
              onValueChange={([v]) => setPrice(v)}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>ZMW 10,000</span>
              <span>ZMW 5,000,000</span>
            </div>
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Down Payment (ZMW)</Label>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-3 text-[#006633] border-[#006633]/30 hover:bg-[#006633]/5"
                onClick={preset20}
              >
                20% of price
              </Button>
            </div>
            <Input
              type="number"
              min={0}
              max={price}
              step={1000}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="h-11 text-base"
            />
            <p className="text-xs text-gray-400">
              {downPayment > 0
                ? `${((downPayment / price) * 100).toFixed(1)}% of property price`
                : 'No down payment'}
            </p>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label className="text-gray-700">
              <Percent className="size-3.5 inline mr-1" />
              Interest Rate (%)
            </Label>
            <Input
              type="number"
              min={5}
              max={40}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="h-11 text-base"
            />
            <Slider
              min={5}
              max={40}
              step={0.1}
              value={[rate]}
              onValueChange={([v]) => setRate(v)}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5%</span>
              <span>40%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <Label className="text-gray-700">
              <Clock className="size-3.5 inline mr-1" />
              Loan Term
            </Label>
            <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
              <SelectTrigger className="w-full h-11 text-base">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30].map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calculate */}
          <Button
            onClick={() => setCalculated(true)}
            className="w-full h-12 text-base font-semibold mt-2 bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#005a2c] hover:to-[#003d1e] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Calculator className="size-5 mr-2" />
            Calculate
          </Button>
        </div>
      </div>

      {/* ── Results Card ────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6">
        {!calculated ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
            <Calculator className="size-16 text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm text-center">
              Fill in the details and click &quot;Calculate&quot; to see your
              mortgage breakdown
            </p>
          </div>
        ) : !results ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-red-100 p-6 relative overflow-hidden card-elevated">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="size-6" />
              <p className="font-medium">
                Down payment cannot be greater than property price.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Monthly Payment Hero */}
            <div className="bg-gradient-to-br from-[#006633] to-[#004d26] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
              <p className="text-green-200 text-sm font-medium mb-1">
                Monthly Payment
              </p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight">
                {currency(results.monthly)}
              </p>
              <p className="text-green-300/70 text-xs mt-2">
                for {term} years at {rate}% interest
              </p>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Payment Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ResultItem
                  label="Total Payment"
                  value={currency(results.total)}
                  icon={<Banknote className="size-4 text-[#006633]" />}
                />
                <ResultItem
                  label="Total Interest"
                  value={currency(results.totalInterest)}
                  icon={<TrendingDown className="size-4 text-orange-500" />}
                />
                <ResultItem
                  label="Down Payment"
                  value={currency(downPayment)}
                  icon={<Banknote className="size-4 text-blue-500" />}
                />
                <ResultItem
                  label="Loan Amount"
                  value={currency(results.loan)}
                  icon={<Banknote className="size-4 text-purple-500" />}
                />
              </div>
            </div>

            {/* Amortisation Schedule */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Yearly Amortisation
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {results.amortisation.map((row) => (
                  <div
                    key={row.year}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-700 w-16">
                      Year {row.year}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#006633] to-[#0d9488]"
                          style={{
                            width: `${
                              (row.principalPaid /
                                (row.principalPaid + row.interestPaid)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right text-xs space-y-0.5">
                      <p className="text-[#006633] font-medium">
                        Principal: {currency(row.principalPaid)}
                      </p>
                      <p className="text-orange-500">
                        Interest: {currency(row.interestPaid)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  )
}

// ─── Tab 2: Affordability Check ─────────────────────────────────────────
function AffordabilityCheck() {
  const [income, setIncome] = useState(15000)
  const [expenses, setExpenses] = useState(5000)
  const [savings, setSavings] = useState(100000)
  const [term, setTerm] = useState(20)
  const [rate, setRate] = useState(25)
  const [checked, setChecked] = useState(false)

  const maxMonthlyPayment = income * 0.3
  const availableMonthly = income - expenses
  const effectiveMonthly = Math.min(maxMonthlyPayment, availableMonthly)

  const results = useMemo(() => {
    if (effectiveMonthly <= 0) return null
    const monthlyRate = rate / 100 / 12
    const months = term * 12
    // Max loan from monthly payment: M = P * r(1+r)^n / ((1+r)^n - 1)  =>  P = M * ((1+r)^n - 1) / (r*(1+r)^n)
    let maxLoan: number
    if (monthlyRate === 0) {
      maxLoan = effectiveMonthly * months
    } else {
      maxLoan =
        (effectiveMonthly *
          (Math.pow(1 + monthlyRate, months) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, months))
    }
    const maxPrice = maxLoan + savings
    const canAfford = availableMonthly >= maxMonthlyPayment * 0.8 // allow some slack
    return { maxLoan, maxPrice, effectiveMonthly, canAfford }
  }, [income, expenses, savings, term, rate, effectiveMonthly, availableMonthly, maxMonthlyPayment])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ── Input Card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Your Financial Details
        </h3>

        <div className="space-y-4">
          {/* Monthly Income */}
          <div className="space-y-2">
            <Label className="text-gray-700">Monthly Income (ZMW)</Label>
            <Input
              type="number"
              min={0}
              step={500}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="h-11 text-base"
            />
          </div>

          {/* Monthly Expenses */}
          <div className="space-y-2">
            <Label className="text-gray-700">Monthly Expenses (ZMW)</Label>
            <Input
              type="number"
              min={0}
              step={500}
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="h-11 text-base"
            />
          </div>

          {/* Down Payment Saved */}
          <div className="space-y-2">
            <Label className="text-gray-700">Down Payment Saved (ZMW)</Label>
            <Input
              type="number"
              min={0}
              step={5000}
              value={savings}
              onChange={(e) => setSavings(Number(e.target.value))}
              className="h-11 text-base"
            />
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <Label className="text-gray-700">
              <Clock className="size-3.5 inline mr-1" />
              Preferred Loan Term
            </Label>
            <Select value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
              <SelectTrigger className="w-full h-11 text-base">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30].map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label className="text-gray-700">
              <Percent className="size-3.5 inline mr-1" />
              Interest Rate (%)
            </Label>
            <Input
              type="number"
              min={5}
              max={40}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="h-11 text-base"
            />
          </div>

          {/* Check */}
          <Button
            onClick={() => setChecked(true)}
            className="w-full h-12 text-base font-semibold mt-2 bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#005a2c] hover:to-[#003d1e] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <CheckCircle2 className="size-5 mr-2" />
            Check Affordability
          </Button>
        </div>
      </div>

      {/* ── Results Card ────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6">
        {!checked ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated flex flex-col items-center justify-center min-h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
            <CheckCircle2 className="size-16 text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm text-center">
              Enter your financial details and click &quot;Check
              Affordability&quot; to see results
            </p>
          </div>
        ) : !results ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-red-100 p-6 relative overflow-hidden card-elevated">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="size-6" />
              <p className="font-medium">
                Your expenses exceed or equal your income. Please review your
                numbers.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Max Affordable Price */}
            <div className="bg-gradient-to-br from-[#006633] to-[#004d26] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
              <p className="text-green-200 text-sm font-medium mb-1">
                Maximum Affordable Price
              </p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight">
                {currency(results.maxPrice)}
              </p>
              <p className="text-green-300/70 text-xs mt-2">
                based on your income and savings
              </p>
            </div>

            {/* Can Afford Indicator */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
              <div className="flex items-center gap-3 mb-4">
                {results.canAfford ? (
                  <>
                    <CheckCircle2 className="size-6 text-[#006633]" />
                    <span className="font-bold text-[#006633]">
                      You can likely afford a mortgage!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-6 text-red-500" />
                    <span className="font-bold text-red-500">
                      It may be difficult to afford a mortgage
                    </span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ResultItem
                  label="Max Monthly Mortgage"
                  value={currency(maxMonthlyPayment)}
                  icon={<Percent className="size-4 text-[#006633]" />}
                />
                <ResultItem
                  label="Available for Mortgage"
                  value={currency(effectiveMonthly)}
                  icon={<Banknote className="size-4 text-blue-500" />}
                />
                <ResultItem
                  label="Monthly Income"
                  value={currency(income)}
                  icon={<Banknote className="size-4 text-green-500" />}
                />
                <ResultItem
                  label="Monthly Expenses"
                  value={currency(expenses)}
                  icon={<TrendingDown className="size-4 text-orange-500" />}
                />
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 relative overflow-hidden card-elevated">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006633] via-[#0d9488] to-[#3b82f6]" />
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="size-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900">Helpful Tips</h3>
              </div>
              <ul className="space-y-3">
                <TipItem text="Zambian banks typically require 10-20% down payment" />
                <TipItem text="Keep monthly debt payments under 30% of income" />
                <TipItem text="Consider additional costs: legal fees, insurance, maintenance" />
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TipItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-600">
      <ChevronDown className="size-4 text-[#006633] mt-0.5 shrink-0 rotate-[-90deg]" />
      <span>{text}</span>
    </li>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#006633]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#006633]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative bg-[#006633] px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <Home className="size-4 text-white" />
        </Link>
        <Link
          href="/"
          className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
        >
          Housemate<span className="text-green-300">.zm</span>
        </Link>
        <span className="text-white/40 mx-1">|</span>
        <h1 className="text-white/80 font-medium text-base">Calculator</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-8 max-w-5xl mx-auto w-full relative z-10 space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#006633]">
            Mortgage &amp; Affordability
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Calculate your mortgage payments or check how much you can afford
          </p>
        </div>

        <Tabs defaultValue="mortgage" className="w-full">
          <TabsList className="w-full h-auto p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
            <TabsTrigger
              value="mortgage"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium data-[state=active]:bg-[#006633] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Calculator className="size-4 mr-1.5" />
              Mortgage Calculator
            </TabsTrigger>
            <TabsTrigger
              value="affordability"
              className="flex-1 rounded-lg py-2.5 text-sm font-medium data-[state=active]:bg-[#006633] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Affordability Check
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mortgage" className="mt-6">
            <MortgageCalculator />
          </TabsContent>

          <TabsContent value="affordability" className="mt-6">
            <AffordabilityCheck />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center pb-10">
        <p className="text-sm text-gray-400">
          &copy; 2026 Housemate ZM. All rights reserved.
        </p>
      </div>
    </div>
  )
}
