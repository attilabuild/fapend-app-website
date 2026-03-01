import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Title, Body, Caption, Subtitle } from "../components/ui/Typography";
import { COLORS, SPACING, FONTS, RADIUS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore, useAchievementStore } from "../hooks/useStore";

type Props = NativeStackScreenProps<RootStackParamList, "ArticleDetail">;

// Mock data for articles by ID
const ARTICLES = {
  "1": {
    title: "Understanding Urges",
    content: `
Urges are powerful, but temporary sensations. They build, peak, and eventually pass.

When you experience an urge, try to observe it with curiosity rather than fear. Notice the physical sensations, thoughts, and emotions without judging them.

Remember that urges cannot force you to act. There is always a space between the urge and your response - in that space lies your freedom and power.

## The Science Behind Urges

Your brain has evolved to seek rewards and avoid pain. When you repeatedly pair a behavior (like viewing porn) with the release of dopamine, your brain creates powerful associations.

These associations trigger urges when you encounter cues (like being alone, bored, stressed, or seeing triggering content).

## Dealing With Urges

1. **Recognize**: Acknowledge the urge without judgment. "I notice I'm experiencing an urge right now."

2. **Accept**: Don't fight against the urge or try to suppress it. Allow it to be present.

3. **Investigate**: Get curious about the sensations. Where do you feel it in your body? Is it static or moving?

4. **Non-identification**: Remember that you are not your urges. They are temporary experiences passing through your awareness.

5. **Redirect**: Once you've observed the urge mindfully, engage in an alternative activity that aligns with your values.
    `,
  },
  "2": {
    title: "The Science of Dopamine",
    content: `
Dopamine is often called the "reward molecule." It plays a central role in motivation, reward, and addiction.

## How Dopamine Works

When you engage in activities that your brain interprets as beneficial for survival or reproduction, dopamine is released. This creates feelings of pleasure and reinforces the behavior.

Natural dopamine releases from healthy activities like exercise, socializing, or accomplishing goals are moderate and sustainable.

## Dopamine and Addiction

Pornography, like other addictive substances and behaviors, causes unnaturally high spikes in dopamine. Over time, this can lead to:

1. **Tolerance**: Needing more intense or novel content to get the same effect

2. **Desensitization**: Finding less pleasure in normal, healthy activities

3. **Withdrawal**: Experiencing negative emotional states when not engaging with the addictive behavior

## Healing Your Dopamine System

The good news is that your brain can heal. When you avoid artificial dopamine spikes from porn:

1. Dopamine receptors begin to regrow and become more sensitive

2. Natural rewards become more pleasurable again

3. Your motivation for healthy activities increases

This process takes time - typically several weeks to months - but the improvements in mood, energy, and enjoyment of life are worth the effort.
    `,
  },
  "3": {
    title: "How Habit Loops Work",
    content: `
      Understanding the structure of habits can help you break unwanted behaviors and establish healthier patterns.

      ## The Habit Loop

      Every habit follows the same basic structure, known as the "habit loop":

      1. **Cue (Trigger)**: The trigger that initiates the habit. This could be a time of day, an emotional state, a location, a preceding event, or the presence of certain people.
      
      2. **Craving**: The desire or motivation that the cue creates. You don't crave the habit itself, but the change in state it delivers.
      
      3. **Response**: The actual habit or behavior you perform.
      
      4. **Reward**: The benefit you gain from the behavior. This satisfies your craving and teaches your brain to remember this pattern for the future.

      ## Breaking the Porn Habit Loop
      
      To break the porn habit loop, you need to identify and address each component:

      1. **Identify your triggers**: Common triggers include boredom, stress, loneliness, being alone with your device, or certain times of day.
      
      2. **Understand your craving**: You're not really craving porn – you're craving the emotional state change (escape, relief, pleasure, distraction) it provides.
      
      3. **Create obstacles to the response**: Make accessing porn more difficult by using blockers, leaving your door open, using devices in public spaces, etc.
      
      4. **Find alternative rewards**: Develop healthier ways to get similar rewards – exercise for stress relief, socializing for emotional connection, creative activities for entertainment.

      Remember, the goal isn't to resist urges through pure willpower but to redesign your environment and routine to make the unwanted behavior difficult while making beneficial behaviors easier.
    `,
  },
  "4": {
    title: "Developing a Growth Mindset",
    content: `
      A growth mindset – the belief that your abilities can be developed through dedication and hard work – is crucial for recovery from any addiction.
      
      ## Fixed vs. Growth Mindset
      
      **Fixed Mindset**:
      - "I'm addicted and will always be this way"
      - "Relapse means I'm a failure"
      - "I don't have enough willpower to change"
      - Avoids challenges and gives up easily
      - Ignores criticism and feedback
      
      **Growth Mindset**:
      - "I can learn to manage my behavior"
      - "Relapse is a learning opportunity"
      - "My strategies need adjustment, not my worth"
      - Embraces challenges as opportunities
      - Learns from criticism and setbacks
      
      ## Developing a Growth Mindset for Recovery
      
      1. **Reframe setbacks**: See relapses as data points that provide valuable information, not moral failures.
      
      2. **Focus on process, not outcome**: Celebrate the daily wins of implementing new habits and strategies.
      
      3. **Embrace discomfort**: Recovery involves discomfort as your brain adjusts to new patterns. Accept this as part of growth.
      
      4. **Use "yet" statements**: Instead of "I can't control these urges," say "I haven't learned to control these urges yet."
      
      5. **Seek feedback**: Join communities where you can learn from others' experiences and insights.
      
      Remember, neuroplasticity (your brain's ability to reorganize itself) works in your favor. With persistent effort and the right strategies, you can create new neural pathways that support healthier behaviors.
    `,
  },
  "5": {
    title: "Overcoming Limiting Beliefs",
    content: `
      Limiting beliefs are thoughts or convictions that constrain us in some way. They can be particularly destructive in recovery, where self-belief is crucial.
      
      ## Common Limiting Beliefs in Recovery
      
      1. **"I'll never be free from this addiction"** – This belief creates a self-fulfilling prophecy where you stop trying.
      
      2. **"I've failed so many times, I can't succeed"** – Past attempts don't determine future outcomes.
      
      3. **"I'm broken/defective"** – This confuses behavior with identity and creates shame.
      
      4. **"Recovery is too hard"** – This belief focuses on discomfort rather than growth.
      
      5. **"I'm different - others can recover, but my case is special"** – This belief isolates you and prevents learning from others.
      
      ## How to Identify Limiting Beliefs
      
      Pay attention to thoughts that:
      - Start with "I can't..." or "I'll never..."
      - Make you feel hopeless or defeated
      - Justify unwanted behavior
      - Prevent you from trying new strategies
      
      ## Challenging and Replacing Limiting Beliefs
      
      1. **Question the evidence**: What facts actually support this belief? What facts contradict it?
      
      2. **Consider the source**: Where did this belief come from? Is it based on reliable information?
      
      3. **Test the belief**: What small action could you take that would challenge this belief?
      
      4. **Create replacement beliefs**: For each limiting belief, develop a more empowering alternative.
      
      5. **Practice daily affirmations**: Regularly repeat your new, empowering beliefs.
      
      Remember that beliefs are not facts – they're learned thought patterns that can be unlearned and replaced with more helpful perspectives.
    `,
  },
  "6": {
    title: "Finding Your Why",
    content: `
      A compelling "why" – a deep, meaningful reason for recovery – is perhaps the strongest motivator for lasting change.
      
      ## The Importance of Finding Your Why
      
      When the journey gets difficult, having a clear purpose will:
      - Provide motivation when willpower is low
      - Help you make consistent decisions aligned with your values
      - Give meaning to short-term discomfort
      - Connect your recovery to your larger life vision
      
      ## Discovering Your Deep Motivation
      
      Your most powerful "why" often connects to:

      1. **Core values**: What principles matter most to you? (Integrity, connection, health, spirituality, etc.)
      
      2. **Future vision**: Who do you want to become? What kind of life do you want to create?
      
      3. **Relationships**: How does your recovery impact those you care about?
      
      4. **Personal growth**: What capabilities or qualities do you want to develop?
      
      5. **Contribution**: How might your recovery allow you to help others?
      
      ## Exercises to Find Your Why
      
      1. **Values identification**: List your top 5 values. How does recovery support living in alignment with these values?
      
      2. **Future self visualization**: Imagine yourself 5 years from now having maintained recovery. What's different? How do you feel?
      
      3. **Cost assessment**: What has your addiction cost you? What future costs do you want to avoid?
      
      4. **Benefit exploration**: What specific benefits of recovery are most meaningful to you?
      
      5. **Letter writing**: Write a letter to someone you care about explaining why you're committed to change.
      
      Remember to review and reconnect with your "why" regularly, especially during challenging times. A strong sense of purpose is one of the most reliable predictors of long-term recovery success.
    `,
  },
  "7": {
    title: "Meditation Techniques",
    content: `
      Meditation is one of the most evidence-based tools for addiction recovery, helping you develop awareness, self-regulation, and resilience.
      
      ## Benefits of Meditation for Recovery
      
      - Increases awareness of triggers and urges
      - Improves impulse control and decision-making
      - Reduces stress and anxiety that often drive relapse
      - Develops self-compassion to counter shame
      - Strengthens the prefrontal cortex (the brain's "executive control" center)
      
      ## Basic Meditation Techniques
      
      1. **Breath Awareness Meditation**
      
         - Sit comfortably with your back straight
         - Focus your attention on your breath
         - Notice the sensation of air moving in and out
         - When your mind wanders, gently return focus to the breath
         - Start with 5 minutes daily, gradually increasing
      
      2. **Body Scan Meditation**
      
         - Lie down or sit comfortably
         - Bring awareness to different parts of your body sequentially
         - Notice any sensations without judgment
         - Particularly helpful for urge surfing
      
      3. **Loving-kindness Meditation**
      
         - Focus on generating feelings of goodwill
         - Silently repeat phrases like "May I be happy, may I be healthy, may I be safe"
         - Extend these wishes to others
         - Counteracts shame and builds self-compassion
      
      ## Tips for Success
      
      - **Start small**: Even 2-5 minutes daily is beneficial
      - **Be consistent**: Daily practice is more important than duration
      - **Use guidance**: Try meditation apps (Headspace, Calm, Insight Timer)
      - **Be patient**: The benefits build gradually over time
      - **Apply mindfulness to urges**: When cravings arise, use your meditation skills to observe without reacting
      
      Remember that meditation is a skill that improves with practice. The goal isn't to have a perfectly clear mind, but to notice when you're distracted and gently return to awareness.
    `,
  },
  "8": {
    title: "Breathing Exercises",
    content: `
      Strategic breathing exercises can quickly shift your physiological state, making them powerful tools for managing urges and reducing stress.
      
      ## How Breathing Affects Your State
      
      - Your breathing pattern directly influences your nervous system
      - Slow, deep breathing activates the parasympathetic "rest and digest" system
      - This counteracts the sympathetic "fight or flight" response often triggered by stress or cravings
      
      ## Key Breathing Techniques
      
      1. **Box Breathing (4-4-4-4)**
      
         - Inhale through your nose for 4 counts
         - Hold your breath for 4 counts
         - Exhale through your mouth for 4 counts
         - Hold the empty lungs for 4 counts
         - Repeat for 5-10 cycles
         - Excellent for stress reduction and focus
      
      2. **Physiological Sigh**
      
         - Take two short inhales through your nose
         - Follow with one long exhale through your mouth
         - Repeat 2-3 times
         - Quickly reduces stress and anxiety
      
      3. **4-7-8 Breathing**
      
         - Inhale through your nose for 4 counts
         - Hold your breath for 7 counts
         - Exhale completely through your mouth for 8 counts
         - Repeat 4 cycles
         - Great for calming the mind before sleep or during intense urges
      
      4. **Alternate Nostril Breathing**
      
         - Close your right nostril with your thumb
         - Inhale through your left nostril
         - Close your left nostril with your ring finger
         - Open and exhale through your right nostril
         - Inhale through your right nostril
         - Close right nostril, exhale through left
         - Repeat for 5-10 cycles
         - Balances energy and calms the mind
      
      ## When to Use Breathing Techniques
      
      - At the first sign of an urge or craving
      - During moments of stress or anxiety
      - As part of your morning routine to set a calm tone
      - Before bed to improve sleep quality
      - Any time you need to quickly reset your state
      
      These techniques are especially powerful because they're always available, require no special equipment, and can be done discreetly in almost any situation.
    `,
  },
  "9": {
    title: "Urge Surfing",
    content: `
      Urge surfing is a mindfulness technique specifically designed to help you ride out cravings without acting on them.
      
      ## Understanding Urges
      
      Urges are like waves - they rise, peak, and eventually subside on their own. The average urge lasts only 20-30 minutes if not reinforced through fantasy or action.
      
      The goal of urge surfing isn't to eliminate urges but to change your relationship with them. By observing urges without resistance, you learn they can't harm you and don't need to control your behavior.
      
      ## How to Practice Urge Surfing
      
      1. **Notice**: Become aware that you're experiencing an urge. Try to catch it early.
      
      2. **Name it**: Acknowledge "This is an urge" or "I notice craving arising."
      
      3. **Locate it**: Where do you feel the urge in your body? Is it a tightness in your chest? Tension in your abdomen? Restlessness in your legs?
      
      4. **Observe without judgment**: Describe the physical sensations to yourself as if you were a curious scientist.
      
      5. **Breathe into it**: Direct your breath toward any areas of tension or discomfort.
      
      6. **Watch it change**: Notice how the sensations shift, move, intensify, and diminish over time.
      
      7. **Remind yourself**: "This is temporary. I don't have to act on this. It will pass."
      
      ## Common Challenges
      
      - **Resistance**: Trying to make the urge go away often makes it stronger. Practice accepting its presence.
      
      - **Identification**: Remember you are not your urges. The phrase "I'm noticing an urge to..." creates helpful distance.
      
      - **Distraction**: While it's fine to distract yourself, true urge surfing involves staying with the experience.
      
      - **Patience**: Initially, urges may feel more intense when you pay attention to them. This is normal and temporary.
      
      With practice, urge surfing becomes a powerful tool that reduces the grip of cravings and builds confidence in your ability to handle them without relapse.
    `,
  },
  "10": {
    title: "Cold Showers",
    content: `
      Cold showers are a surprisingly effective tool for addiction recovery, offering both immediate relief from urges and long-term benefits for self-discipline and wellbeing.
      
      ## Benefits for Recovery
      
      1. **Immediate urge disruption**: The shock of cold water creates an immediate pattern interrupt when experiencing cravings.
      
      2. **Dopamine regulation**: Regular cold exposure helps normalize dopamine activity, which is often dysregulated in addiction.
      
      3. **Stress resilience**: Cold showers build your capacity to tolerate discomfort, a crucial skill for recovery.
      
      4. **Improved mood**: Cold exposure increases endorphins and norepinephrine, potentially reducing depression and anxiety.
      
      5. **Will power training**: Choosing discomfort builds the "decision muscle" needed for recovery.
      
      ## How to Incorporate Cold Showers
      
      1. **Start gradually**: Begin with your normal shower, then finish with 15-30 seconds of cold water.
      
      2. **Focus on breathing**: When the cold hits, your breath will naturally shorten. Consciously maintain slow, deep breaths.
      
      3. **Progressive exposure**: Gradually increase your cold exposure time over weeks.
      
      4. **Emergency tool**: Use a brief cold shower as an immediate intervention when experiencing strong urges.
      
      5. **Mindset matters**: Rather than dreading the cold, approach it as training for your mind. Say "This is an opportunity to get stronger."
      
      ## Technique Options
      
      1. **Cold Finisher**: End your regular shower with 30-60 seconds of the coldest setting.
      
      2. **Contrast Shower**: Alternate between 30 seconds of hot and 30 seconds of cold, ending with cold.
      
      3. **Full Cold Shower**: For maximum benefit, take a fully cold shower for 3-5 minutes.
      
      4. **Face/Wrist Splash**: If a full shower isn't possible, even cold water on your face, neck, and wrists can help reset your state.
      
      Remember that the initial shock only lasts about 20 seconds before your body adapts. This mirrors the recovery process itself - temporary discomfort leading to lasting benefits.
    `,
  },
  "11": {
    title: "Creating an Emergency Plan",
    content: `
      An emergency relapse prevention plan is like a personal fire escape plan - you hope you'll never need it, but having it ready can prevent disaster.
      
      ## Why You Need an Emergency Plan
      
      Most relapses occur during moments of unexpected vulnerability when:
      - Your normal coping strategies aren't accessible
      - You face unusually strong triggers
      - You're experiencing heightened emotional states
      - Your decision-making capacity is compromised
      
      Having a pre-determined action plan removes the need to make decisions when you're in a vulnerable state.
      
      ## Building Your Emergency Plan
      
      1. **Identify high-risk situations**:
         - Being alone late at night
         - After arguments or disappointments
         - While traveling
         - During periods of stress, boredom, or fatigue
         - After exposure to triggers
      
      2. **Create environmental barriers**:
         - Emergency website blockers or app restrictions
         - Phone lockbox with timed release
         - Preset distraction activities
         - Environmental changes (move to public space, open door, etc.)
      
      3. **Prepare supportive contacts**:
         - List 3-5 people you can contact anytime
         - Script exactly what you'll say ("I'm having a hard moment and need to talk")
         - Include professional resources (therapist, support line)
      
      4. **Design pattern interrupts**:
         - Physical activities (pushups, cold shower, run)
         - Sensory interrupts (taste something sour, hold ice cube)
         - Location changes (go outside, move to different room)
         - Breathing exercises (4-7-8 breathing)
      
      5. **Create a delay strategy**:
         - Set a timer for 20 minutes before acting on urges
         - Use this time to implement other parts of your plan
         - Remember that most urges diminish within 20-30 minutes
      
      ## Implementing Your Plan

      1. Write it down clearly and concisely
      2. Keep multiple copies in accessible places
      3. Practice it during calm times
      4. Review and update it regularly
      5. Activate it at the FIRST sign of struggle, not the last
      
      The most effective emergency plans are simple, specific, and practiced in advance. Remember, using your plan is a sign of strength, not weakness.
    `,
  },
  "12": {
    title: "Identifying Your Triggers",
    content: `
      Triggers are the specific cues that activate cravings and potentially lead to relapse. Identifying and managing your personal triggers is a cornerstone of effective recovery.
      
      ## Categories of Triggers
      
      1. **External Triggers** (environmental cues):
         - Locations (bedroom, bathroom, specific room in the house)
         - Devices (smartphone, computer, tablet)
         - Times of day (late night, early morning)
         - Visual cues (certain types of images, videos, or advertisements)
         - Substances (alcohol, which lowers inhibitions)
      
      2. **Internal Triggers** (emotional and physical states):
         - Emotional states (boredom, loneliness, stress, anxiety, celebration)
         - Physical states (fatigue, insomnia, illness)
         - Thought patterns (sexual fantasy, entitlement thinking)
         - Mental states (autopilot mode, mindlessness)
      
      3. **Social Triggers**:
         - Being alone for extended periods
         - Relationship conflicts
         - Social rejection or disappointment
         - Peer environments where objectification is normalized
      
      ## Mapping Your Personal Triggers
      
      Create a trigger log with these components:
      
      1. **Situation**: What was happening when you felt the urge?
      2. **Thoughts**: What were you thinking just before?
      3. **Feelings**: What emotions were you experiencing?
      4. **Physical sensations**: How did your body feel?
      5. **Intensity**: Rate the strength of the urge (1-10)
      6. **Response**: How did you handle it?
      7. **Aftermath**: What happened afterward?
      
      ## Developing Trigger Management Strategies
      
      For each identified trigger, develop a specific plan:
      
      1. **Avoid**: Which triggers can you completely eliminate?
      2. **Alter**: How can you modify situations to reduce trigger strength?
      3. **Alternative**: What healthy substitutes can replace the triggered behavior?
      4. **Awareness**: How can you increase mindfulness around unavoidable triggers?
      
      Remember that triggers themselves aren't the problem - it's the automatic reactions to them. With awareness and planning, you can change these reactions and reduce triggers' power over your behavior.
    `,
  },
  "13": {
    title: "Bouncing Back After a Relapse",
    content: `
      Relapse is a common part of the recovery process, not a sign of failure. How you respond to a relapse largely determines whether it becomes a brief setback or the beginning of a downward spiral.
      
      ## Understanding Relapse
      
      Relapse is typically a process, not a single event:
      
      1. **Emotional relapse**: Neglecting self-care, isolation, mood swings
      2. **Mental relapse**: Cravings, glorifying past use, bargaining, planning
      3. **Physical relapse**: The actual return to the unwanted behavior
      
      Recognizing where you are in this process allows for earlier intervention.
      
      ## Immediate Steps After Relapse
      
      1. **Break the cycle immediately**: Don't use the "I've already relapsed" justification to continue the behavior.
      
      2. **Show self-compassion**: Harsh self-criticism increases shame, which fuels addiction. Speak to yourself as you would to a good friend who is struggling.
      
      3. **Reconnect with support**: Reach out to a trusted person or community. Isolation after relapse is particularly dangerous.
      
      4. **Reset your environment**: Clear triggers, recommit to structure, and reestablish boundaries.
      
      5. **Physical reset**: Focus on sleep, hydration, nutrition, and exercise to restore physiological balance.
      
      ## Learning from Relapse
      
      Once the immediate aftermath has passed:
      
      1. **Analyze without judgment**: What sequence of events, thoughts, and feelings led to the relapse?
      
      2. **Identify the breakdown point**: Where specifically did your recovery plan fail to protect you?
      
      3. **Update your strategy**: What specific changes can strengthen your plan?
      
      4. **Set realistic goals**: Consider whether your recovery expectations need adjustment.
      
      5. **Re-commit to fundamentals**: Return to the basic practices that built your initial progress.
      
      ## Preventing Relapse Spiral
      
      Many people experience not just a relapse but a "collapse" where they abandon all recovery efforts. To prevent this:
      
      1. Pre-commit to specific post-relapse actions
      2. Distinguish between a lapse (brief return) and a relapse (extended return)
      3. Define success as how quickly you re-establish recovery, not perfect abstinence
      4. Remember that each recovery attempt increases your ultimate chances of success
      
      Remember that most successful recoveries include multiple setbacks. What separates those who ultimately succeed is their ability to use relapses as learning opportunities rather than reasons to give up.
    `,
  },
  "14": {
    title: "Neuroplasticity and Recovery",
    content: `
      Neuroplasticity—your brain's ability to reorganize itself by forming new neural connections—is the biological mechanism that makes recovery possible.
      
      ## Understanding Brain Changes in Addiction
      
      Addiction creates several neurological adaptations:
      
      1. **Hypersensitized reward pathways**: Your brain develops powerful associations between cues and the anticipated reward.
      
      2. **Desensitized pleasure response**: Natural rewards become less satisfying as the brain adapts to unnaturally strong stimulation.
      
      3. **Weakened prefrontal cortex**: The brain region responsible for judgment and impulse control becomes less effective.
      
      4. **Strengthened habit circuits**: Behaviors become increasingly automatic and require less conscious thought.
      
      ## How Neuroplasticity Enables Recovery
      
      The same plasticity that created addiction pathways allows for their reversal:
      
      1. **Neural pruning**: When circuits aren't used, connections weaken ("neurons that fire apart, wire apart").
      
      2. **New circuit formation**: Repeated healthy behaviors create new, stronger pathways.
      
      3. **Prefrontal strengthening**: Mindfulness and consistent decision-making rebuild impulse control capacity.
      
      4. **Reward system recovery**: Natural rewards gradually become satisfying again as sensitivity returns.
      
      ## Practical Applications
      
      1. **Consistent repetition**: Every time you resist an urge, you weaken the corresponding neural pathway.
      
      2. **Healthy substitution**: Actively engaging in alternative rewarding activities creates competing pathways.
      
      3. **Mindfulness practice**: Meditation and mindfulness strengthen the prefrontal cortex.
      
      4. **Deliberate discomfort**: Voluntarily facing challenges (exercise, cold exposure) builds resilience circuits.
      
      5. **Sleep optimization**: Quality sleep is crucial for neuroplastic changes to consolidate.
      
      ## Timeline for Neural Recovery
      
      While individual experiences vary, research suggests:
      
      - **Days 1-7**: Dopamine transmission begins normalizing
      - **Weeks 2-4**: Cravings typically peak then begin decreasing
      - **Months 1-3**: Most withdrawal symptoms resolve
      - **Months 3-6**: Significant improvements in prefrontal function
      - **6+ months**: Major neural adaptations become more permanent
      
      Understanding that recovery is a physical process of brain remodeling can provide hope and patience. Your brain is highly adaptable, and every day of recovery strengthens the neural circuits that support a healthier life.
    `,
  },
  "15": {
    title: "Building Healthy Relationships",
    content: `
      Healthy relationships are both a goal of recovery and a powerful support for it. Many addictive behaviors are attempts to meet legitimate human needs in destructive ways.
      
      ## How Relationships Impact Recovery
      
      1. **Connection as an antidote to addiction**: Authentic connection provides many of the same neurochemical rewards (oxytocin, dopamine) that addiction artificially stimulated.
      
      2. **Safety net function**: Supportive relationships provide accountability and help during vulnerable moments.
      
      3. **Identity reinforcement**: Relationships that see and affirm your true self help counter shame and isolation.
      
      4. **Skill development**: Healthy relationships provide a context to practice emotional regulation and communication.
      
      ## Areas for Relationship Development
      
      1. **Existing relationships**:
         - Rebuilding trust through consistency
         - Establishing healthy boundaries
         - Developing emotional intimacy
         - Learning to be present without distractions
      
      2. **New connections**:
         - Recovery communities
         - Activity-based friendships
         - Service and volunteer opportunities
         - Interest groups unrelated to recovery
      
      3. **Intimate relationships**:
         - Addressing pornography's impact on expectations
         - Developing non-objectifying perspectives
         - Building emotional and physical intimacy
         - Honest communication about recovery
      
      ## Practical Relationship Skills
      
      1. **Vulnerability courage**: Sharing appropriate levels of yourself authentically
      
      2. **Active listening**: Being fully present without planning your response
      
      3. **Needs communication**: Expressing needs directly without manipulation
      
      4. **Boundary setting**: Defining and maintaining healthy limits
      
      5. **Conflict navigation**: Addressing issues without avoiding or escalating
      
      ## Warning Signs of Unhealthy Relationships
      
      - They trigger or encourage addictive behaviors
      - You feel you need to hide parts of yourself
      - Interactions leave you emotionally drained
      - The relationship reinforces shame
      - Recovery boundaries aren't respected
      
      Remember that relationship development takes time. Start with small steps of authentic connection and gradually build your capacity for deeper relationships as your recovery strengthens.
    `,
  },
  "16": {
    title: "Long-term Strategies",
    content: `
      Long-term recovery requires moving beyond just avoiding relapse to building a fulfilling life that makes addiction progressively less appealing.
      
      ## From Recovery to Thriving
      
      1. **Purpose development**: Finding meaningful work, service, or creative expression that provides natural rewards and direction.
      
      2. **Identity transformation**: Shifting from "recovering addict" to a more complete self-definition based on values and contributions.
      
      3. **Growth mindset**: Viewing recovery as one aspect of continuous personal development.
      
      4. **Value-driven living**: Making decisions based on core values rather than temporary feelings.
      
      5. **Community integration**: Being part of something larger than yourself.
      
      ## Sustainable Recovery Practices
      
      1. **Maintenance level self-care**:
         - Consistent sleep schedule
         - Nutritional awareness
         - Regular exercise
         - Stress management routines
         - Digital boundaries
      
      2. **Ongoing skill development**:
         - Emotional intelligence
         - Interpersonal effectiveness
         - Stress resilience
         - Meaning-making
         - Flow state activities
      
      3. **Community involvement**:
         - Mentoring others
         - Sharing your story
         - Creating recovery resources
         - Advocacy work
      
      4. **Relapse prevention evolution**:
         - Regular recovery plan updates
         - Anticipating life transitions
         - Periodic check-ins with support system
         - Continuing education about addiction
      
      ## Navigating Inevitable Challenges
      
      1. **Life transitions**: Relationships, jobs, locations
      2. **Success stressors**: Achievement can sometimes trigger entitlement
      3. **Complacency periods**: When recovery seems "solved"
      4. **Identity evolution**: Wrestling with "who am I now?"
      5. **Existential questions**: Finding deeper meaning and purpose
      
      ## Signs of Successful Long-term Recovery
      
      - Decreased obsession with both the addiction and recovery itself
      - Increased capacity for presence and genuine connection
      - Recovery tools becoming integrated life skills
      - Growing ability to experience difficult emotions without escaping
      - Expanding sense of possibility and hope
      
      Remember that recovery is not the end goal but rather the foundation that allows you to build a meaningful, connected, and purposeful life - one that makes returning to addiction increasingly less appealing.
    `,
  },
};

const ArticleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { articleId, title, categoryId } = route.params;
  const [isArticleRead, setIsArticleRead] = useState(false);
  const { user } = useAuthStore();
  const { checkAndUpdateAchievements } = useAchievementStore();

  // Get article content from mock data
  const article = ARTICLES[articleId as keyof typeof ARTICLES];

  // Load read status on mount
  useEffect(() => {
    const loadReadStatus = async () => {
      if (user && user._id) {
        try {
          const readArticles = await AsyncStorage.getItem(
            `readArticles_${user._id}`,
          );
          if (readArticles) {
            const articlesArray = JSON.parse(readArticles);
            setIsArticleRead(articlesArray.includes(articleId));
          }
        } catch (error) {
          console.error("Error loading read status:", error);
        }
      }
    };

    loadReadStatus();
  }, [user, articleId]);

  const markAsRead = async () => {
    if (!user || !user._id) {
      Alert.alert("Error", "You need to be logged in to track your progress");
      return;
    }

    try {
      // Get existing read articles
      const readArticles = await AsyncStorage.getItem(
        `readArticles_${user._id}`,
      );
      let articlesArray = readArticles ? JSON.parse(readArticles) : [];

      // Add current article if not already present
      if (!articlesArray.includes(articleId)) {
        articlesArray.push(articleId);
        await AsyncStorage.setItem(
          `readArticles_${user._id}`,
          JSON.stringify(articlesArray),
        );
      }

      // Update state
      setIsArticleRead(true);

      // Check achievements
      checkAndUpdateAchievements(
        user._id,
        undefined,
        undefined,
        articlesArray.length,
      );

      // Success notification
      Alert.alert("Success", "Article marked as read and progress updated!", [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to refresh the GuideScreen
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error marking article as read:", error);
      Alert.alert("Error", "Failed to update progress");
    }
  };

  // Function to parse and render formatted content
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // First process the content to handle whitespace properly
    // Remove leading/trailing whitespace and normalize all whitespace within paragraphs
    const processedContent = content
      .replace(/^\s+|\s+$/g, "") // Remove leading/trailing whitespace from content
      .replace(/\n\s+/g, "\n") // Remove leading spaces from each line
      .replace(/\n{3,}/g, "\n\n"); // Replace multiple empty lines with just two

    // Split by newlines
    const lines = processedContent.split("\n");

    return (
      <View style={styles.formattedContent}>
        {lines.map((line, index) => {
          const trimmedLine = line.trim();

          // Check if line is a heading (##)
          if (trimmedLine.startsWith("##")) {
            return (
              <Text key={index} style={styles.heading2}>
                {trimmedLine.replace("##", "").trim()}
              </Text>
            );
          }

          // Check if line is a numbered list item (starts with a number followed by period)
          if (/^\d+\.\s/.test(trimmedLine)) {
            // Process numbered list items with potential bold text
            if (trimmedLine.includes("**")) {
              const textContent = trimmedLine.replace(/^\d+\.\s/, ""); // Remove the number and period
              const parts = textContent.split("**");
              const formattedParts = [];

              // Add bullet point or number
              const numberMatch = trimmedLine.match(/^\d+\./);
              formattedParts.push(
                <Text key={`${index}-prefix`} style={styles.listItemNumber}>
                  {numberMatch && numberMatch[0] ? numberMatch[0] : "1."}{" "}
                </Text>,
              );

              // Process bold and regular text
              for (let i = 0; i < parts.length; i++) {
                if (parts[i].trim() === "") continue;

                if (i % 2 === 1) {
                  // Bold text
                  formattedParts.push(
                    <Text key={`${index}-${i}`} style={styles.boldText}>
                      {parts[i]}
                    </Text>,
                  );
                } else {
                  // Regular text
                  formattedParts.push(
                    <Text key={`${index}-${i}`} style={styles.regularText}>
                      {parts[i]}
                    </Text>,
                  );
                }
              }

              return (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.paragraph}>{formattedParts}</Text>
                </View>
              );
            } else {
              // Simple numbered list item without bold text
              const numberMatch = trimmedLine.match(/^\d+\./);
              const number =
                numberMatch && numberMatch[0] ? numberMatch[0] : "1.";
              const text = trimmedLine.replace(/^\d+\.\s/, "");

              return (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.paragraph}>
                    <Text style={styles.listItemNumber}>{number} </Text>
                    <Text style={styles.regularText}>{text}</Text>
                  </Text>
                </View>
              );
            }
          }

          // Regular paragraph
          if (trimmedLine !== "") {
            // Check if paragraph contains bold text
            if (trimmedLine.includes("**")) {
              const parts = trimmedLine.split("**");
              const formattedParts = [];

              // Process bold and regular text
              for (let i = 0; i < parts.length; i++) {
                if (parts[i].trim() === "") continue;

                if (i % 2 === 1) {
                  // Bold text
                  formattedParts.push(
                    <Text key={`${index}-${i}`} style={styles.boldText}>
                      {parts[i]}
                    </Text>,
                  );
                } else {
                  // Regular text
                  formattedParts.push(
                    <Text key={`${index}-${i}`} style={styles.regularText}>
                      {parts[i]}
                    </Text>,
                  );
                }
              }

              return (
                <Text
                  key={index}
                  style={[styles.paragraph, { color: COLORS.textPrimary }]}
                >
                  {formattedParts}
                </Text>
              );
            } else {
              // Regular paragraph without bold text
              return (
                <Text
                  key={index}
                  style={[styles.paragraph, { color: COLORS.textPrimary }]}
                >
                  {trimmedLine}
                </Text>
              );
            }
          }

          // Empty line - add spacing, but make it smaller
          return <View key={index} style={styles.emptyLine} />;
        })}
      </View>
    );
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Title>Article not found</Title>
        </View>
      </SafeAreaView>
    );
  }

  // Get the category title
  const getCategoryTitle = (id: string) => {
    const categories = {
      basics: "Basics",
      mindset: "Mindset",
      tools: "Tools",
      relapse: "Relapse Prevention",
      advanced: "Advanced",
    };
    return categories[id as keyof typeof categories] || id;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Title style={styles.title}>{article.title}</Title>
          <Caption style={styles.category}>
            From {getCategoryTitle(categoryId)}
          </Caption>

          <View style={styles.separator} />

          {renderFormattedContent(article.content)}

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.markAsReadButton}
              onPress={markAsRead}
              disabled={isArticleRead}
            >
              <Ionicons
                name={
                  isArticleRead
                    ? "checkmark-circle"
                    : "checkmark-circle-outline"
                }
                size={24}
                color={isArticleRead ? COLORS.success : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.markAsReadText,
                  isArticleRead ? { color: COLORS.success } : {},
                ]}
              >
                {isArticleRead ? "Marked as Read" : "Mark as Read"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    marginBottom: SPACING.xs,
  },
  category: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.cardLight,
    marginVertical: SPACING.md,
  },
  content: {
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  actionContainer: {
    marginTop: SPACING.xl,
    alignItems: "center",
  },
  markAsReadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  markAsReadText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  formattedContent: {
    marginBottom: SPACING.lg,
  },
  heading2: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "bold",
    color: COLORS.accent,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  boldText: {
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  regularText: {
    color: COLORS.textPrimary,
  },
  paragraph: {
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  emptyLine: {
    height: SPACING.sm,
  },
  listItemNumber: {
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  listItem: {
    marginBottom: SPACING.md,
  },
});

export default ArticleDetailScreen;
