import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, gradient = "from-primary to-secondary", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-card/50 to-card backdrop-blur-xl hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground font-medium leading-tight">{title}</p>
              <p className="text-3xl font-bold text-white">
                {value}
              </p>
            </div>
            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
