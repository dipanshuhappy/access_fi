'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useSignMessage, useWriteContract } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import zkeSDK, { Proof } from "@zk-email/sdk"
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ArrowLeft, Upload, Shield, CheckCircle, AlertCircle, Loader2, Mail, FileKey, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react'
import { VERIFY_PROOF, ZK_EMAIL_CIRCUIT_VKEY } from "src/constant"
import { pools, poolsToVerifications } from '~/constant'
import { teeApi } from '~/lib/teeApi'
import { SimpleViemEncryption } from '~/lib/encryption'
import { zkVerifyClient } from '~/lib/zkVerifyClient'
import { accessFiPoolAbi, verifyProofAbi } from '~/generated'

interface Pool {
  id: string;
  title: string;
  usdcAmount: number;
  minAccessTokens: number;
  totalVolume: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  isActive: boolean;
  address: string;
  timeLeft: string;
}

const riskColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

type Step = 1 | 2 | 3 | 4 | 5
type StepStatus = 'idle' | 'loading' | 'success' | 'error'

export default function JoinPoolPage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const poolAddress = params['pool_address'] as string

  // Find the pool by address from the pools constant
  const pool = pools.filter((p) => p.address.toLowerCase() === poolAddress?.toLowerCase())[0];

  // Get verification data for this pool
  const poolVerifications = poolsToVerifications[poolAddress?.toLowerCase() as keyof typeof poolsToVerifications];
  const verificationName = poolVerifications ? Object.keys(poolVerifications)[0] : null;
  const verificationData = verificationName ? poolVerifications[verificationName as keyof typeof poolVerifications] : null;

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())
  const [stepStatuses, setStepStatuses] = useState<Record<Step, StepStatus>>({
    1: 'idle',
    2: 'idle',
    3: 'idle',
    4: 'idle',
    5: 'idle'
  })

  // Step 1: Email
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  // Step 2: Message signing
  const [signedMessage, setSignedMessage] = useState<string>('')
  const [messageHash, setMessageHash] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('0x73e5ecc892241dfd6c2dd8dee9ce5992858c2aae3698d49b3ff7640c0c43c69f')

  // Step 3: EML Upload (existing logic)
  const [proof, setProof] = useState<Proof | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Step 4: TEE Verification choice
  const [wantsTeeVerification, setWantsTeeVerification] = useState<boolean | null>(null)

  // Step 5: Public key and encryption
  const [showFullPublicKey, setShowFullPublicKey] = useState(false)
  const [encryptionResult, setEncryptionResult] = useState<any>(null)

  // Fetch public key for step 5
  const { data: publicKeyData, isLoading: publicKeyLoading, error: publicKeyError } = useQuery({
    queryKey: ['tee-public-key'],
    queryFn: () => teeApi.getPublicKey(),
  })

  const updateStepStatus = (step: Step, status: StepStatus) => {
    setStepStatuses(prev => ({ ...prev, [step]: status }))
  }

  const markStepComplete = (step: Step) => {
    setCompletedSteps(prev => new Set(prev).add(step))
    updateStepStatus(step, 'success')
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const { writeContractAsync: writeVerification } = useWriteContract()

  // Step 1: Handle email submission
  const handleEmailNext = () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    setEmailError('')
    markStepComplete(1)
    setCurrentStep(2)
  }

  // Step 2: Handle message signing
  const handleSignMessage = async () => {
    if (!address) return

    updateStepStatus(2, 'loading')
    try {
      const messageToSign = "This is my wallet"
      const signature = await signMessageAsync({ message: messageToSign })

      // Create hash using keccak256
      const hash = keccak256(toBytes(messageToSign + signature))

      setSignedMessage(signature)
      setMessageHash(hash)

      // Call sendVerificationEmail
      await teeApi.sendVerificationEmail({
        hash,
        signature: signature as `0x${string}`,
        email
      })

      markStepComplete(2)
      setCurrentStep(3)
    } catch (error) {
      console.error('Error signing message:', error)
      updateStepStatus(2, 'error')
    }
  }

  // Step 3: Handle file upload (existing logic)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    updateStepStatus(3, 'loading')
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
      const blueprint = await sdk.getBlueprint("dipanshuhappy/Access_Fi@v1")
      console.log({ blueprint })

      // Create a prover
      const prover = blueprint.createProver()
      console.log({ prover })

      // Generate the proof
      // const generatedProof = await prover.generateLocalProof(eml)
      // console.log({ generatedProof })
      // setProof(generatedProof)
      // let regResponse = JSON.parse(localStorage.getItem("vkey-hash-zk-verify") ?? "{}")

      // if (!regResponse || !regResponse.vkHash || !regResponse.meta.vkHash) {
      //   let regResponse = await zkVerifyClient.registerVk({
      //     IC: ZK_EMAIL_CIRCUIT_VKEY.IC as any,
      //     curve: "bn128",
      //     protocol: "groth16",
      //     nPublic: 5,
      //     vk_alpha_1: ZK_EMAIL_CIRCUIT_VKEY.vk_alpha_1 as any,
      //     vk_alphabeta_12: ZK_EMAIL_CIRCUIT_VKEY.vk_alphabeta_12 as any,
      //     vk_beta_2: ZK_EMAIL_CIRCUIT_VKEY.vk_beta_2 as any,
      //     vk_delta_2: ZK_EMAIL_CIRCUIT_VKEY.vk_delta_2 as any,
      //     vk_gamma_2: ZK_EMAIL_CIRCUIT_VKEY.vk_gamma_2 as any,
      //   })
      //   console.log({ regResponse })
      //   localStorage.setItem("vkey-hash-zk-verify", JSON.stringify(regResponse))
      // }
      const submitProof = await zkVerifyClient.submitProof(
        {

          "pi_a": [
            "7094405373306079611294790792957429106748015457216552938216667584057334962418",
            "19073452512777104214007158354280180599024522646467835641287295653868474738263",
            "1"
          ],
          "pi_b": [
            [
              "18922952037462526571037389214917465923809843557356300513607644114051535041735",
              "8550417848367883391437782026408756142237213207494351387744411469269469982739"
            ],
            [
              "15197283407707277777101957664682149910660437937024458743822509917219957446417",
              "11825498665477459766071291897116995113795604366108599507552875312304748324561"
            ],
            [
              "1",
              "0"
            ]
          ],
          "pi_c": [
            "10337664011691543916388756140611295179447538532655666493217246097272777874978",
            "14601885642312915113674021340503161247149573215793657076918124878486096160072",
            "1"
          ],
          "protocol": "groth16",
          "curve": "bn128"

        },
        [
          // ...generatedProof.props.publicOutputs as string[]

          "4117284665558983232764772093921811699956980420110648228412176780686103515577",
          "284479183135761776289538166806186257527",
          "32136565990701346420525990179942457715",
          "39607578684639533461548108958174631260788",
          "0"

        ],
        ZK_EMAIL_CIRCUIT_VKEY,
        false
      )

      if (submitProof.optimisticVerify != "success") {
        console.error("Proof verification, check proof artifacts");
        return;
      }

      // Poll job status until completion
      // console.log("Waiting for job to finalize...");
      // let jobStatus;
      // while (true) {
      //   jobStatus = await zkVerifyClient.getJobStatus(submitProof.jobId);
      //   if (jobStatus.status === "Aggregated") {
      //     console.log("Job finalized successfully");
      //     console.log(jobStatus);
      //     break;
      //   } else if (jobStatus.status === "Failed") {
      //     console.error("Job failed:", jobStatus);
      //     setVerificationStatus('error')
      //     setErrorMessage('ZK proof verification failed on relayer')
      //     return;
      //   } else {
      //     console.log("Job status:", jobStatus.status);
      //     console.log("Waiting for job to finalize...");
      //     await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      //   }
      // }

      // console.log({ jobStatus })
      // console.log({ submitProof })

      // Verify the proof
      setVerificationStatus('verifying')
      // const verification = await blueprint.verifyProof(generatedProof)
      const hash = "jhljl"
      // const hash = await writeVerification({
      //   abi: verifyProofAbi,
      //   address: VERIFY_PROOF,
      //   functionName: "verifyAndMint",
      //   args: [
      //     BigInt(jobStatus.aggregationId ?? 0),
      //     BigInt(113),
      //     jobStatus.aggregationDetails?.merkleProof as `0x${string}`[],
      //     jobStatus.aggregationDetails?.leaf as `0x${string}`,
      //     BigInt(jobStatus.aggregationDetails?.numberOfLeaves ?? 0),
      //     BigInt(jobStatus.aggregationDetails?.leafIndex ?? 0)
      //   ]
      // })






      if (hash) {
        setVerificationStatus('success')
        // setTxHash(hash)
        markStepComplete(3)
        setCurrentStep(4)
      } else {
        setVerificationStatus('error')
        setErrorMessage('Proof verification failed')
        updateStepStatus(3, 'error')
      }

      // console.log("Proof:", generatedProof)
      // console.log("Verification:", verification)
    } catch (error) {
      console.error("Error generating proof:", error)
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while processing the file')
      updateStepStatus(3, 'error')
    }
  }

  // Step 4: Handle TEE verification choice
  const handleTeeVerificationChoice = (choice: boolean) => {
    setWantsTeeVerification(choice)
    markStepComplete(4)
    if (choice) {
      setCurrentStep(5)
    } else {
      // TODO: Handle skip case - maybe go to final join step
      handleJoinPool()
    }
  }

  // Step 5: Handle encryption
  const handleEncryption = async () => {
    if (!publicKeyData?.publicKey || !address) return

    updateStepStatus(5, 'loading')
    try {


      const messageToEncrypt = `Email: ${email}, Wallet: ${address}, Proof: ${JSON.stringify(proof)}`
      const encrypted = SimpleViemEncryption.encrypt(messageToEncrypt, publicKeyData.publicKey as `0x${string}`)


      // Call TEE API encrypt
      await teeApi.encrypt({
        secret: encrypted.encryptedData,
        nonce: encrypted.nonce,
        txHash: txHash as `0x${string}`
      })

      setEncryptionResult(encrypted)
      markStepComplete(5)

      // TODO: Call smart contract here
      console.log('TODO: Call smart contract with encrypted proof')

    } catch (error) {
      console.error('Error during encryption:', error)
      updateStepStatus(5, 'error')
    }
  }

  const handleJoinPool = async () => {
    // if (!proof) return

    // TODO: Call smart contract to join pool
    console.log('TODO: Call smart contract to join pool with proof:', proof)
    const hash = await writeVerification({
      abi: accessFiPoolAbi,
      address: poolAddress as `0x${string}`,
      functionName: "enterPoolAsSeller"
    })
    console.log({ hash })
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

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 1: return 'Enter Email'
      case 2: return 'Sign Message'
      case 3: return 'Upload Email File'
      case 4: return 'TEE Verification'
      case 5: return 'Encrypt & Submit'
      default: return ''
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>
            <Button onClick={handleEmailNext} className="w-full">
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">Message to sign: <strong>"This is my wallet"</strong></p>
              <p className="text-xs text-muted-foreground mt-2">
                Email: {email}
              </p>
            </div>
            {stepStatuses[2] === 'error' && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Failed to sign message or send verification email</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSignMessage}
                disabled={stepStatuses[2] === 'loading'}
                className="flex-1"
              >
                {stepStatuses[2] === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    Sign Message <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
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
                    disabled={stepStatuses[3] === 'loading'}
                    className="hidden"
                  />
                  <Button variant="outline" disabled={stepStatuses[3] === 'loading'}>
                    {stepStatuses[3] === 'loading' ? (
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
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="text-center p-6">
              <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">TEE Verification</h3>
              <p className="text-muted-foreground mb-6">
                Would you like to add an additional layer of security with TEE (Trusted Execution Environment) verification?
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleTeeVerificationChoice(false)}
                  className="px-8"
                >
                  Skip
                </Button>
                <Button
                  onClick={() => handleTeeVerificationChoice(true)}
                  className="px-8"
                >
                  Yes, Verify
                </Button>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">TEE Public Key</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullPublicKey(!showFullPublicKey)}
                >
                  {showFullPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {publicKeyLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading public key...</span>
                </div>
              ) : publicKeyError ? (
                <p className="text-sm text-red-500">Error loading public key</p>
              ) : (
                <code className="text-xs bg-background p-2 rounded font-mono break-all block">
                  {showFullPublicKey
                    ? publicKeyData?.publicKey
                    : `${publicKeyData?.publicKey?.slice(0, 20)}...${publicKeyData?.publicKey?.slice(-20)}`
                  }
                </code>
              )}
            </div>

            {stepStatuses[5] === 'error' && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Failed to encrypt data or submit to TEE</span>
              </div>
            )}

            {encryptionResult && (
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
                <span className="text-green-800">Data encrypted successfully!</span>
              </div>
            )}

            <Button
              onClick={handleEncryption}
              disabled={stepStatuses[5] === 'loading' || !publicKeyData?.publicKey}
              className="w-full"
            >
              {stepStatuses[5] === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <FileKey className="w-4 h-4 mr-2" />
                  Encrypt & Submit
                </>
              )}
            </Button>

            {encryptionResult && (
              <Button
                onClick={handleJoinPool}
                className="w-full bg-gradient-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90"
                size="lg"
              >
                Join Pool with Verified Proof
              </Button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-600 font-bold text-lg">Pool not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Join Pool: <span className="text-primary">{pool.title}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete the {verificationName || 'ZK Email'} verification process to join this exclusive pool
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pool Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-fit border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {pool.title}
                  </CardTitle>
                  <div className={`p-1.5 rounded-full ${riskColors[pool.risk as keyof typeof riskColors]}`}>
                    {pool.risk.toUpperCase()} RISK
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pool.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-muted/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pool Size</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(pool.usdcAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Min. Access Tokens</span>
                    <span className="font-medium">
                      {pool.minAccessTokens} ACCESS
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Pool Address</div>
                  <code className="text-xs bg-muted p-2 rounded font-mono break-all">
                    {pool.address}
                  </code>
                </div>
                {/* Verification Info */}
                {verificationName && verificationData && (
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">
                      Verification: <span className="font-semibold">{verificationName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-semibold">Title:</span> {verificationData.title}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="font-semibold">Description:</span> {verificationData.description}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Verification Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Process
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of 5: {getStepTitle(currentStep)}
                </div>
                {/* Progress indicator */}
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full ${completedSteps.has(step as Step)
                        ? 'bg-green-500'
                        : currentStep === step
                          ? 'bg-primary'
                          : 'bg-muted'
                        }`}
                    />
                  ))}
                </div>
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
                  renderStepContent()
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
