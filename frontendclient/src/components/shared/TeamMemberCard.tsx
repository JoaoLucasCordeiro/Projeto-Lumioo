import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Github, Mail, BookOpen } from "lucide-react";

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  email?: string;
  lattes?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  initials: string;
  bio: string;
  skills: string[];
  contributions: string[];
  social: SocialLinks;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ y: -5 }}
      className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 border-2 border-red-500/50 mx-auto md:mx-0">
            <AvatarImage src={member.image} alt={member.name} />
            <AvatarFallback className="bg-red-900/30 text-red-400 text-2xl font-bold">
              {member.initials}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-slate-100 mb-2">{member.name}</h3>
          <p className="text-red-400 font-medium mb-4">{member.role}</p>
          <p className="text-slate-300 mb-4">{member.bio}</p>
          
          <div className="mb-4">
            <h4 className="text-slate-100 font-semibold mb-2">Principais Contribuições:</h4>
            <ul className="text-slate-400 text-sm list-disc list-inside">
              {member.contributions.map((contribution, i) => (
                <li key={i}>{contribution}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {member.skills.map((skill, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="bg-red-900/20 border-red-700/50 text-red-400"
              >
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-3">
            {Object.entries(member.social).map(([platform, url]) => (
              <motion.a
                key={platform}
                href={url}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {platform === 'linkedin' && <Linkedin className="h-5 w-5 text-slate-300 hover:text-red-400" />}
                {platform === 'github' && <Github className="h-5 w-5 text-slate-300 hover:text-red-400" />}
                {platform === 'email' && <Mail className="h-5 w-5 text-slate-300 hover:text-red-400" />}
                {platform === 'lattes' && <BookOpen className="h-5 w-5 text-slate-300 hover:text-red-400" />}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}