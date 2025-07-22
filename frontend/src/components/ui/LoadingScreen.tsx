export function LoadingScreen() {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-primary blur-3xl opacity-50 animate-pulse-custom" />
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 shadow-2xl animate-bounce-custom">
              <div className="text-6xl">🏰</div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-warning flex items-center justify-center text-sm font-bold text-white animate-spin-slow">
              ✨
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">
            Империя TON
          </h1>
          
          {/* Loading Progress */}
          <div className="w-48 mx-auto">
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse-custom" 
                   style={{
                     width: '70%',
                     animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                   }} />
            </div>
          </div>
          
          {/* Loading Dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-white glow-accent"
                style={{
                  opacity: 0.3,
                  animation: `fadeIn 1.4s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
          
          <p className="text-white/80 text-sm animate-fade-in">
            Загружаем вашу империю...
          </p>
        </div>
        
        {/* Background Effects */}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-success blur-3xl opacity-20 animate-pulse-custom" />
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-gradient-warning blur-3xl opacity-20 animate-pulse-custom" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-gradient-danger blur-2xl opacity-20 animate-bounce-custom" style={{animationDelay: '0.5s'}} />
      </div>
    </div>
  )
}