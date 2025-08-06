'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { ArrowLeft, Sparkles, Plus, Shield, Zap, TrendingUp, Users } from 'lucide-react'

interface CreatePoolFormData {
  poolName: string
  selectedProofs: string[]
  customProof: string
  useCustomProof: boolean
  poolSize: string
  minAccessTokens: string
  apy: string
  duration: string
}

const predefinedProofs = [
  {
    name: 'Email Domain Verification',
    description: 'Verify ownership of specific email domains',
    icon: '📧'
  },
  {
    name: 'GitHub Contribution',
    description: 'Prove contributions to specific repositories',
    icon: '💻'
  },
  {
    name: 'Twitter Verification',
    description: 'Verify Twitter account ownership and activity',
    icon: '🐦'
  },
  {
    name: 'Academic Credential',
    description: 'Prove academic qualifications or certifications',
    icon: '🎓'
  },
  {
    name: 'Professional License',
    description: 'Verify professional licenses or memberships',
    icon: '💼'
  },
  {
    name: 'KYC Verification',
    description: 'Standard identity verification process',
    icon: '🆔'
  }
]

export default function CreatePoolPage() {
  const router = useRouter()
  const { isConnected } = useAccount()

  const [formData, setFormData] = useState<CreatePoolFormData>({
    poolName: '',
    selectedProofs: [],
    customProof: '',
    useCustomProof: false,
    poolSize: '',
    minAccessTokens: '',
    apy: '',
    duration: ''
  })

  const handleProofToggle = (proofName: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedProofs: [...formData.selectedProofs, proofName]
      })
    } else {
      setFormData({
        ...formData,
        selectedProofs: formData.selectedProofs.filter(p => p !== proofName)
      })
    }
  }

  const handleCreatePool = () => {
    console.log('Creating pool:', formData)
    // Here you would integrate with your smart contract to create the pool
    // For now, redirect back to pools page
    router.push('/')
  }

  const isFormValid = formData.poolName &&
    formData.poolSize &&
    formData.minAccessTokens &&
    formData.apy &&
    formData.duration &&
    ((!formData.useCustomProof && formData.selectedProofs.length > 0) ||
      (formData.useCustomProof && formData.customProof))

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">


          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Create New <span className="text-primary">Liquidity Pool</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Design your exclusive pool with custom verification requirements and attractive yields
            </p>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Create New Pool
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Configure your pool settings and verification requirements
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {!isConnected ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground">
                      Please connect your wallet to create a new liquidity pool
                    </p>
                  </div>
                  <ConnectButton />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pool Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Pool Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="poolName" className="text-sm font-medium">
                          Pool Name
                        </Label>
                        <Input
                          id="poolName"
                          placeholder="Enter pool name"
                          value={formData.poolName}
                          onChange={(e) => setFormData({ ...formData, poolName: e.target.value })}
                          className="px-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="poolSize" className="text-sm font-medium">
                          Pool Size (USDC)
                        </Label>
                        <Input
                          id="poolSize"
                          type="number"
                          placeholder="100000"
                          value={formData.poolSize}
                          onChange={(e) => setFormData({ ...formData, poolSize: e.target.value })}
                          className="px-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minAccessTokens" className="text-sm font-medium">
                          Min. Access Tokens Required
                        </Label>
                        <Input
                          id="minAccessTokens"
                          type="number"
                          placeholder="1000"
                          value={formData.minAccessTokens}
                          onChange={(e) => setFormData({ ...formData, minAccessTokens: e.target.value })}
                          className="px-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apy" className="text-sm font-medium">
                          Target APY (%)
                        </Label>
                        <Input
                          id="apy"
                          type="number"
                          step="0.1"
                          placeholder="24.5"
                          value={formData.apy}
                          onChange={(e) => setFormData({ ...formData, apy: e.target.value })}
                          className="px-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="duration" className="text-sm font-medium">
                          Pool Duration (days)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="30"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="px-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Verification Requirements */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Verification Requirements
                    </h3>

                    <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
                      <Checkbox
                        id="useCustomProof"
                        checked={formData.useCustomProof}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          useCustomProof: checked as boolean,
                          selectedProofs: [],
                          customProof: ''
                        })}
                      />
                      <Label htmlFor="useCustomProof" className="text-sm font-medium cursor-pointer">
                        Use custom verification requirement
                      </Label>
                    </div>

                    {!formData.useCustomProof ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Select Verification Types</span>
                          <span className="text-xs text-muted-foreground">
                            {formData.selectedProofs.length} selected
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {predefinedProofs.map((proof) => (
                            <div key={proof.name} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                              <Checkbox
                                id={proof.name}
                                checked={formData.selectedProofs.includes(proof.name)}
                                onCheckedChange={(checked) => handleProofToggle(proof.name, checked as boolean)}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{proof.icon}</span>
                                  <Label htmlFor={proof.name} className="text-sm font-medium cursor-pointer">
                                    {proof.name}
                                  </Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {proof.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="customProof" className="text-sm font-medium">
                          Custom Verification Requirement
                        </Label>
                        <Input
                          id="customProof"
                          placeholder="Describe your custom proof requirement (e.g., Proof of NFT ownership, Proof of DAO membership)"
                          value={formData.customProof}
                          onChange={(e) => setFormData({ ...formData, customProof: e.target.value })}
                          className="px-4 py-3 text-lg border-2 focus:border-primary transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 rounded-lg border">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Pool Preview
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Pool Size</div>
                        <div className="font-semibold">{formData.poolSize ? `$${parseInt(formData.poolSize).toLocaleString()}` : '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Target APY</div>
                        <div className="font-semibold text-primary">{formData.apy ? `${formData.apy}%` : '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Min. Tokens</div>
                        <div className="font-semibold">{formData.minAccessTokens || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="font-semibold">{formData.duration ? `${formData.duration} days` : '-'}</div>
                      </div>
                    </div>

                    {(formData.selectedProofs.length > 0 || formData.customProof) && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Required Verifications</div>
                        <div className="flex flex-wrap gap-2">
                          {formData.useCustomProof ? (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              Custom: {formData.customProof.substring(0, 30)}{formData.customProof.length > 30 ? '...' : ''}
                            </span>
                          ) : (
                            formData.selectedProofs.map((proof) => (
                              <span key={proof} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {proof}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="px-8 py-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePool}
                      disabled={!isFormValid}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Pool
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
