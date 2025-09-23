import { useState, useEffect, useCallback } from "react";

interface HackingMinigameProps {
  onClose: () => void;
}

export default function HackingMinigame({ onClose }: HackingMinigameProps) {
  const [stage, setStage] = useState<'binary' | 'cipher' | 'pattern' | 'complete'>('binary');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);

  // Binary Decoding Challenge
  const [binaryChallenge, setBinaryChallenge] = useState('');
  const [binaryAnswer, setBinaryAnswer] = useState('');
  const [binaryInput, setBinaryInput] = useState('');

  // Cipher Challenge
  const [cipherText, setCipherText] = useState('');
  const [cipherKey, setCipherKey] = useState(3);
  const [cipherInput, setCipherInput] = useState('');
  const [cipherAnswer, setCipherAnswer] = useState('');

  // Pattern Matching Challenge
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showingPattern, setShowingPattern] = useState(false);

  const generateBinaryChallenge = useCallback(() => {
    const words = ['ACCESS', 'SECURE', 'UNLOCK', 'BYPASS', 'DECODE'];
    const word = words[Math.floor(Math.random() * words.length)];
    const binary = word.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
    
    setBinaryChallenge(binary);
    setBinaryAnswer(word);
  }, []);

  const generateCipherChallenge = useCallback(() => {
    const phrases = ['OPEN DOOR', 'MAIN FRAME', 'SHUT DOWN', 'OVERRIDE', 'TERMINAL'];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const key = Math.floor(Math.random() * 25) + 1;
    
    const encrypted = phrase.split('').map(char => {
      if (char === ' ') return ' ';
      const code = char.charCodeAt(0) - 65;
      const shifted = (code + key) % 26;
      return String.fromCharCode(shifted + 65);
    }).join('');
    
    setCipherText(encrypted);
    setCipherKey(key);
    setCipherAnswer(phrase);
  }, []);

  const generatePattern = useCallback(() => {
    const newPattern = [];
    for (let i = 0; i < 6; i++) {
      newPattern.push(Math.floor(Math.random() * 9));
    }
    setPattern(newPattern);
    setUserPattern([]);
    
    // Show pattern for 3 seconds
    setShowingPattern(true);
    setTimeout(() => setShowingPattern(false), 3000);
  }, []);

  useEffect(() => {
    generateBinaryChallenge();
    generateCipherChallenge();
    generatePattern();
  }, [generateBinaryChallenge, generateCipherChallenge, generatePattern]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFailed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkBinaryAnswer = () => {
    if (binaryInput.toUpperCase() === binaryAnswer) {
      setScore(prev => prev + 100);
      setStage('cipher');
      generateCipherChallenge();
    } else {
      setScore(prev => Math.max(0, prev - 50));
    }
    setBinaryInput('');
  };

  const checkCipherAnswer = () => {
    if (cipherInput.toUpperCase() === cipherAnswer) {
      setScore(prev => prev + 150);
      setStage('pattern');
      generatePattern();
    } else {
      setScore(prev => Math.max(0, prev - 75));
    }
    setCipherInput('');
  };

  const addToPattern = (num: number) => {
    const newPattern = [...userPattern, num];
    setUserPattern(newPattern);
    
    if (newPattern.length === pattern.length) {
      if (JSON.stringify(newPattern) === JSON.stringify(pattern)) {
        setScore(prev => prev + 200);
        setStage('complete');
      } else {
        setScore(prev => Math.max(0, prev - 100));
        setUserPattern([]);
      }
    }
  };

  const closeHacking = () => {
    onClose();
  };

  if (failed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-100">
        <div className="spy-panel border-red-400">
          <div className="p-8 text-center">
            <div className="text-red-400 text-2xl font-bold mb-4">SYSTEM LOCKDOWN</div>
            <div className="text-white mb-4">Security protocols activated. Hack attempt failed.</div>
            <button className="spy-button border-red-400 text-red-400" onClick={closeHacking}>
              DISCONNECT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-100">
        <div className="spy-panel border-green-400">
          <div className="p-8 text-center">
            <div className="text-green-400 text-2xl font-bold mb-4">ACCESS GRANTED</div>
            <div className="text-white mb-2">System successfully compromised</div>
            <div className="text-blue-400 mb-4">Final Score: {score} points</div>
            <div className="text-xs text-gray-400 mb-4">
              Time remaining: {timeLeft}s | Efficiency: {Math.round((score / 450) * 100)}%
            </div>
            <button className="spy-button" onClick={closeHacking}>
              DOWNLOAD DATA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-100">
      <div className="spy-panel max-w-2xl w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="spy-text text-xl font-bold">SYSTEM INTRUSION</h2>
              <div className="text-xs text-blue-400">Bypassing corporate security protocols</div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-lg font-mono">{timeLeft}s</div>
              <div className="text-xs text-gray-400">Score: {score}</div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center mb-6">
            {['binary', 'cipher', 'pattern'].map((stg, index) => (
              <div
                key={stg}
                className={`flex items-center ${index < 2 ? 'mr-4' : ''}`}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    stage === stg
                      ? 'border-green-400 bg-green-400'
                      : index < ['binary', 'cipher', 'pattern'].indexOf(stage)
                      ? 'border-green-400 bg-green-900'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                />
                {index < 2 && <div className="w-8 h-px bg-gray-600 mx-2" />}
              </div>
            ))}
          </div>

          {/* Binary Decoding Stage */}
          {stage === 'binary' && (
            <div>
              <h3 className="text-green-400 text-lg font-bold mb-4">BINARY DECRYPTION</h3>
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">Decode the binary sequence:</div>
                <div className="bg-gray-900 p-4 rounded border border-green-400 font-mono text-green-400">
                  {binaryChallenge}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={binaryInput}
                  onChange={(e) => setBinaryInput(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 text-white font-mono"
                  placeholder="Enter decoded text..."
                  onKeyDown={(e) => e.key === 'Enter' && checkBinaryAnswer()}
                />
                <button className="spy-button px-4" onClick={checkBinaryAnswer}>
                  DECODE
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Hint: Each 8-bit sequence represents an ASCII character
              </div>
            </div>
          )}

          {/* Caesar Cipher Stage */}
          {stage === 'cipher' && (
            <div>
              <h3 className="text-green-400 text-lg font-bold mb-4">CIPHER DECRYPTION</h3>
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">
                  Decrypt the Caesar cipher (Shift: {cipherKey}):
                </div>
                <div className="bg-gray-900 p-4 rounded border border-green-400 font-mono text-green-400">
                  {cipherText}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cipherInput}
                  onChange={(e) => setCipherInput(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-600 px-3 py-2 text-white font-mono"
                  placeholder="Enter decrypted text..."
                  onKeyDown={(e) => e.key === 'Enter' && checkCipherAnswer()}
                />
                <button className="spy-button px-4" onClick={checkCipherAnswer}>
                  DECRYPT
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Apply reverse Caesar cipher with the given shift value
              </div>
            </div>
          )}

          {/* Pattern Recognition Stage */}
          {stage === 'pattern' && (
            <div>
              <h3 className="text-green-400 text-lg font-bold mb-4">PATTERN RECOGNITION</h3>
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">
                  {showingPattern ? 'Memorize this sequence:' : 'Reproduce the sequence:'}
                </div>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {pattern.map((num, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 border-2 border-green-400 flex items-center justify-center font-mono font-bold ${
                        showingPattern
                          ? 'bg-green-900 text-green-400'
                          : userPattern[index] !== undefined
                          ? userPattern[index] === num
                            ? 'bg-green-900 text-green-400'
                            : 'bg-red-900 text-red-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {showingPattern || userPattern[index] !== undefined ? num : '?'}
                    </div>
                  ))}
                </div>
                {!showingPattern && (
                  <div className="grid grid-cols-9 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => addToPattern(i)}
                        className="spy-button w-10 h-10 text-sm"
                        disabled={userPattern.length >= pattern.length}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {showingPattern
                  ? 'Study the pattern carefully...'
                  : `Enter sequence: ${userPattern.length}/${pattern.length}`}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
            <button className="spy-button border-red-400 text-red-400" onClick={closeHacking}>
              ABORT HACK
            </button>
            <div className="text-xs text-gray-400">
              Security Level: CORPORATE | Encryption: AES-256
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
