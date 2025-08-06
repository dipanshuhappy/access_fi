'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import zkeSDK, { Proof } from "@zk-email/sdk"
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ArrowLeft, Upload, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Pool {
  id: string;
  title: string;
  usdcAmount: number;
  minAccessTokens: number;
  apy: number;
  totalStaked: number;
  participants: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  isActive: boolean;
  timeLeft: string;
}

// Mock pool data - in real app, this would be fetched from API
const mockPoolData: Pool = {
  id: '1',
  title: 'DeFi Yield Optimizer',
  usdcAmount: 125000,
  minAccessTokens: 1000,
  apy: 24.5,
  totalStaked: 2400000,
  participants: 156,
  risk: 'medium',
  category: 'yield',
  tags: ['High APY', 'Auto-compound', 'Verified'],
  isActive: true,
  timeLeft: '5d 12h'
}

const riskColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

export default function JoinPoolPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected } = useAccount()
  const poolAddress = params['pool-address'] as string

  const [proof, setProof] = useState<Proof | null>(null)
  const [loading, setLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setVerificationStatus('idle')
    setErrorMessage('')

    try {
      // Read the file as text
      const eml = await file.text()
      console.log({ eml })
      // Initialize the SDK
      const sdk = zkeSDK()

      console.log({ sdk })

      // Get the blueprint
      const blueprint = await sdk.getBlueprint("Bisht13/SuccinctZKResidencyInvite@v3")
      console.log({ blueprint })


      // Create a prover
      const prover = blueprint.createProver()
      console.log({ prover })


      // Generate the proof
      const generatedProof = await prover.generateLocalProof(eml)
      console.log({ generatedProof })
      setProof(generatedProof)

      // Verify the proof
      setVerificationStatus('verifying')
      const verification = await blueprint.verifyProof(generatedProof)

      if (verification) {
        setVerificationStatus('success')
      } else {
        setVerificationStatus('error')
        setErrorMessage('Proof verification failed')
      }

      console.log("Proof:", generatedProof)
      console.log("Verification:", verification)
    } catch (error) {
      console.error("Error generating proof:", error)
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while processing the file')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinPool = async () => {
    if (!proof || verificationStatus !== 'success') return

    // Here you would integrate with your smart contract to join the pool
    console.log('Joining pool with proof:', proof)
    // Redirect back to pools or show success message
    router.push('/')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">


          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Join Pool: <span className="text-primary">{mockPoolData.title}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Verify your eligibility using ZK Email proof to join this exclusive pool
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pool Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {mockPoolData.title}
                  <Badge className={riskColors[mockPoolData.risk]}>
                    {mockPoolData.risk.toUpperCase()} RISK
                  </Badge>
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mockPoolData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Pool Size</div>
                    <div className="font-bold text-lg">{formatCurrency(mockPoolData.usdcAmount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">APY</div>
                    <div className="font-bold text-lg text-primary">{mockPoolData.apy}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Min. Access Tokens</div>
                    <div className="font-medium">{mockPoolData.minAccessTokens} ACCESS</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                    <div className="font-medium">{mockPoolData.participants}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Pool Address</div>
                  <code className="text-xs bg-muted p-2 rounded font-mono break-all">
                    {poolAddress}
                  </code>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ZK Proof Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  ZK Email Verification
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your email file (.eml) to generate a zero-knowledge proof of eligibility
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="text-center py-8">
                    <ConnectButton />
                    <p className="text-sm text-muted-foreground mt-4">
                      Please connect your wallet to continue
                    </p>
                  </div>
                ) : (
                  <>
                    {/* File Upload */}
                    <div className="space-y-4">
                      <label className="block">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <div className="text-lg font-medium mb-2">Upload Email File</div>
                          <div className="text-sm text-muted-foreground mb-4">
                            Select a .eml file to generate your proof
                          </div>
                          <input
                            type="file"
                            accept=".eml"
                            onChange={handleFileUpload}
                            disabled={loading}
                            className="hidden"
                          />
                          <Button variant="outline" disabled={loading}>
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Choose File'
                            )}
                          </Button>
                        </div>
                      </label>
                    </div>

                    {/* Verification Status */}
                    {verificationStatus !== 'idle' && (
                      <div className="space-y-4">
                        {verificationStatus === 'verifying' && (
                          <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-blue-800">Verifying proof...</span>
                          </div>
                        )}

                        {verificationStatus === 'success' && (
                          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-800">Proof verified successfully!</span>
                          </div>
                        )}

                        {verificationStatus === 'error' && (
                          <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <div>
                              <div className="text-red-800 font-medium">Verification failed</div>
                              {errorMessage && (
                                <div className="text-sm text-red-600 mt-1">{errorMessage}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Proof Details */}
                    {proof && verificationStatus === 'success' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-2">Generated Proof</div>
                          <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-40">
                            {JSON.stringify(proof, null, 2)}
                          </pre>
                        </div>

                        <Button
                          onClick={handleJoinPool}
                          className="w-full bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
                          size="lg"
                        >
                          Join Pool with Verified Proof
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
